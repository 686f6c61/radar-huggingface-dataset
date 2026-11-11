# hletrd/tensix-bfp-gptq

## Resumen

`tensix-bfp-gptq` es una herramienta de cuantización desarrollada por el usuario `hletrd` que convierte modelos de lenguaje de Hugging Face a los formatos de coma flotante por bloques (block floating point, BFP) de TT-NN, concretamente `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8), para su ejecución en NPUs Tensix de Tenstorrent. No se trata de un modelo de lenguaje en sí, sino de un pipeline de cuantización basado en GPTQ (Frantar et al., 2022) que redondea las capas lineales de un LLM a la rejilla numérica exacta que utiliza el hardware Tensix.

El problema que resuelve es la brecha entre los pesos en bf16 de un checkpoint estándar y el empaquetado BFP que TT-NN realiza en el host: si el runtime vuelve a redondear los pesos, se pierde precisión. La herramienta produce un checkpoint safetensors en bf16 cuyos valores ya están sobre la rejilla BFP, de modo que TT-NN lo empaqueta sin redondear de nuevo y un transformers ejecutado en CPU o GPU corre exactamente los mismos pesos que la NPU.

Es relevante porque permite cuantizar modelos densos de 4B a 31B parámetros (Qwen3, Qwen2.5, Qwen3.5/3.8, Gemma 4, Ministral 3 y Llama 3.x) a 4,5 o 8,5 bits por peso con una fidelidad verificada bit a bit contra el empaquetador de tt-metal. La licencia es Apache-2.0 y el proyecto se distribuye como paquete Python 3.11+.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta de cuantización (GPTQ) para LLMs transformer densos; formatos destino BFP4/BFP8 de TT-NN |
| Parametros totales | no disponible (depende del modelo de origen; soporta desde 4B hasta 31B) |
| Parametros activos | no disponible (los modelos soportados son densos, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo de origen) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso), BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso), bf16; métodos GPTQ o to-nearest; variante `exp` para BFP4 |
| Idiomas soportados | no disponible (heredados del modelo de origen; la calibración usa WikiText-2 en inglés y extractos de Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en bf16 con valores sobre la rejilla BFP; empaquetado posterior a formato TT-NN |

## Arquitectura y entrenamiento

La herramienta opera sobre las capas lineales de LLMs transformer densos y las redondea a los formatos BFP de TT-NN. En TT-NN, el producto `x @ W` se calcula con `W` en disposición `[in, out]` (la transpuesta del peso de un `Linear` de PyTorch). En disposición de tiles, cada bloque de 16 valores consecutivos de una fila comparte un único exponente de 8 bits (el mayor de los 16), y cada valor conserva un signo y una mantisa con uno inicial explícito: 3 bits para BFP4 y 7 bits para BFP8, lo que da 4,5 y 8,5 bits por peso respectivamente. La función `tensix_bfp.bfp.bfp()` replica bit a bit el empaquetador de host de tt-metal, y el test `tests/test_ttnn_pack.py` lo verifica contra `ttnn.as_tensor`.

GPTQ redondea un canal de entrada cada vez y reparte el error de cada columna entre las columnas aún no redondeadas; como un bloque BFP queda dentro de una sola columna, GPTQ se aplica sin modificaciones. Para BFP4, el método por defecto `exp` prueba además un paso menos en el exponente de cada bloque y conserva el que produce menor error: bajar un paso recorta los valores mayores en el código superior y coloca el resto en una rejilla el doble de fina. La calibración toma `[calib] tokens` repartidos uniformemente sobre `[calib] texts` en secuencias de `[calib] seq`, usando WikiText-2 (train y test) y extractos de Wikipedia en coreano, ambos con licencia CC BY-SA y descargados desde su origen con verificación de SHA-256. Para Llama, Ministral 3 y Gemma 4, cada secuencia empieza con el token de inicio de secuencia, como en la herramienta de perplejidad de llama.cpp.

## Capacidades

- Cuantización GPTQ de capas lineales de LLMs de Hugging Face a BFP4 y BFP8 de TT-NN, o redondeo to-nearest.
- Selección granular de grupos a cuantizar: `attn_qkv`, `attn_o`, `mlp_gate_up`, `mlp_down`, `lm_head`; en Qwen3.5 además `gdn_in`, `gdn_out` y `ab`; también `all`, `mix` y `mlp`.
- Cuantización por capas concretas mediante `GROUP@LAYERS=FMT` con sintaxis como `36-39+50`.
- Método `exp` para BFP4, que evalúa dos exponentes por bloque y elige el de menor error.
- Control del damping de GPTQ mediante `damp=X`.
- Exportación a safetensors bf16 con valores exactos sobre la rejilla BFP, ejecutables tanto en la NPU como en CPU/GPU con transformers.
- Compatibilidad verificada con `ttnn.as_tensor`, tt-transformers con `--use_hf_rope` y demos de tt-metal con dtypes coincidentes.
- Empaquetado en host con `tools/pack_tensix.py` y posibilidad de ejecución sobre tarjeta Tenstorrent o simulador ttsim.
- Soporte de familias: `qwen3` (Qwen3-4B, Qwen3-8B), `qwen2` (Qwen2.5-7B, con biases q/k/v tal cual), `qwen3_5` (Qwen3.5/3.8 dense con Gated DeltaNet y atención con puerta: 4B, 9B, 27B y Arete-27B), `gemma4` (E2B, E4B, 31B, incluida variante QAT E2B), `gemma4_unified` (12B), `ministral3` (14B, desde copia solo texto) y `llama` (Llama 3.1-8B).

## Casos de uso

- Despliegue de LLMs en NPUs Tenstorrent: cuantizar un Qwen3-4B o Llama 3.1-8B a BFP4 para ejecutarlo en hardware Tensix con pesos que coinciden exactamente con los del checkpoint, evitando el doble redondeo del runtime.
- Validación de precisión antes de invertir en hardware: generar el checkpoint cuantizado y ejecutarlo con transformers en CPU o GPU para medir perplejidad y calidad con los mismos pesos que correrá la NPU.
- Investigación en cuantización de bajo bitwidth: comparar GPTQ frente a to-nearest y el método `exp` frente al redondeo estándar en BFP4 sobre familias concretas, con calibración reproducible y hashes verificados.
- Ajuste fino de la mezcla de precisión por capas: mantener `lm_head` en bf16 y cuantizar solo atención y MLP a BFP4, o aplicar BFP4 únicamente a las capas 36-39 y 50, para equilibrar tamaño y calidad.
- Integración en pipelines de CI que verifiquen la paridad de empaquetado bit a bit con tt-metal (`tests/test_ttnn_pack.py`), detectando regresiones entre versiones de ttnn.
- Evaluación de modelos largos en memoria limitada de acelerador: el export procesa una capa decodificadora a la vez, por lo que solo necesita espacio para una capa y las activaciones de calibración, no el modelo completo.
- Preparación de modelos para demos de tt-metal y tt-transformers con dtypes coincidentes, garantizando que los resultados reproducidos en host coincidan con los del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El export requiere Python 3.11 o superior (3.12 para el extra `.[ttnn]`); dependencias base: torch, safetensors, transformers, tokenizers, numpy y accelerate.
- El extra `.[ttnn]` instala ttnn 0.81.1, que distribuye wheels para Linux x86_64 con glibc 2.34 o superior; en otras plataformas el extra se instala sin ttnn.
- El export corre una capa decodificadora a la vez, de modo que la GPU necesita espacio para una capa y las activaciones de calibración, no para el modelo completo; se admite `--device cuda:0`.
- ttnn empaqueta en el host pero requiere una tarjeta Tenstorrent o el simulador de Tenstorrent; sin tarjeta puede usarse ttsim (probado con v1.15.1) con `TT_METAL_SIMULATOR` y `TT_METAL_SLOW_DISPATCH_MODE=1`.
- Las idas y vueltas al dispositivo (`--device`, el test de DRAM) requieren además SFPI 7.89.0, instalado en el directorio `runtime` del paquete ttnn.
- Para tt-metal anterior a v0.83, `soc_descriptor.yaml` debe situarse junto a la librería del simulador.
- VRAM estimada, GPU recomendadas, latencia y throughput: no disponible.

## Comparativa con modelos similares

| Herramienta | Formato destino | Método | Modelos soportados | Licencia |
|---|---|---|---|---|
| tensix-bfp-gptq | BFP4/BFP8 de TT-NN | GPTQ, to-nearest, `exp` | Qwen3, Qwen2.5, Qwen3.5/3.8, Gemma 4, Ministral 3, Llama 3.x | Apache-2.0 |
| GPTQ (Frantar et al., 2022) | Enteros de 3-4 bits | GPTQ | LLMs transformer genéricos | no disponible |
| Empaquetador de host de tt-metal (`ttnn.as_tensor`) | BFP4/BFP8 de TT-NN | Redondeo al empaquetar | Genérico | no disponible |
| llama.cpp (herramienta de perplejidad) | GGUF (K-quants, etc.) | Varios | Amplio catálogo | no disponible |

La diferencia principal frente a GPTQ genérico es que aquí el objetivo es la rejilla BFP con exponente compartido por bloque de 16 valores, no una rejilla entera uniforme. Frente al empaquetador de tt-metal, la herramienta evita el redondeo doble al precolocar los valores exactamente donde el runtime los empaquetará.

## Limitaciones y advertencias

- No es un modelo de lenguaje: es una herramienta de cuantización; sus capacidades dependen enteramente del checkpoint de origen.
- Los formatos soportados son exclusivamente BFP4, BFP8 y bf16; no hay soporte de otros esquemas de cuantización.
- La lista de modelos soportados está cerrada a las familias y configuraciones indicadas (`qwen3`, `qwen2`, `qwen3_5`, `gemma4`, `gemma4_unified`, `ministral3`, `llama`); otros modelos requerirían una configuración nueva.
- Los valores solo se conservan exactos si el runtime empaqueta en `[in, out]` con el mismo formato o uno más ancho; tt-transformers sin `--use_hf_rope` y el `experimental_weight_dtype` de tt-forge vuelven a redondear los pesos.
- La calibración depende de WikiText-2 y de extractos de Wikipedia en coreano: los artículos cambian con el tiempo, por lo que una descarga nueva puede no coincidir con el hash SHA-256 registrado.
- El uso de ttnn requiere Linux x86_64 con glibc 2.34 o superior, tarjeta Tenstorrent o simulador, y SFPI 7.89.0 para las operaciones de dispositivo.
- Riesgo de degradación de calidad en BFP4 (4,5 bits/peso) según el modelo y la mezcla de grupos cuantizados; el método `exp` mitiga el error pero no lo elimina.
- Sesgos, alucinaciones y limitaciones idiomáticas: no disponible en la información proporcionada; dependen del modelo de origen.
- Licencia Apache-2.0, permisiva para uso comercial; las licencias de los modelos de origen y de los textos de calibración (CC BY-SA) deben respetarse por separado.

## Enlaces

- [Hugging Face: hletrd/tensix-bfp-gptq](https://huggingface.co/hletrd/tensix-bfp-gptq)
- [tt-metal v0.81.1](https://github.com/tenstorrent/tt-metal/releases/tag/v0.81.1)
- [ttsim](https://github.com/tenstorrent/ttsim)
- [ttsim v1.15.1 (release)](https://github.com/tenstorrent/ttsim/releases/download/v1.15.1/libttsim_bh.so)
- [Descriptor SoC Blackhole 140 de tt-metal](https://raw.githubusercontent.com/tenstorrent/tt-metal/v0.81.1/tt_metal/soc_descriptors/blackhole_140_arch.yaml)
- [SFPI 7.89.0](https://github.com/tenstorrent/sfpi/releases/download/7.89.0/sfpi_7.89.0_x86_64_debian.txz)
- [Organización Xylolabs en Hugging Face](https://huggingface.co/Xylolabs)
