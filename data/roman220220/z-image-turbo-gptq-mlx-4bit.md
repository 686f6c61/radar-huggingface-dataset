# roman220220/z-image-turbo-gptq-mlx-4bit

## Resumen

Z-Image-Turbo GPTQ MLX 4-bit es una cuantizacion de 4 bits del modelo de generacion de imagenes Z-Image-Turbo (Tongyi-MAI), un diffusion transformer de 6,15B parametros destilado a 9 pasos de inferencia. La publica el usuario roman220220 como checkpoint comunitario, no oficial, y su objetivo es permitir la generacion de imagenes en local sobre Apple Silicon reduciendo el pico de memoria de ~8,7 GB (version 8-bit) a ~5,6 GB sin cambiar el formato de checkpoint que ya usa mflux.

La innovacion concreta frente a la cuantizacion estandar de mflux (`--quantize 4`, que aplica round-to-nearest) es el uso de GPTQ con correccion de error basada en el Hessiano: se capturan activaciones del propio bucle de denoising real del modelo, se corrigen las lineales de atencion y feed-forward de los 30 bloques del transformer y despues se recuantizan. Segun el autor, el resultado ocupa y tarda lo mismo que la cuantizacion RTN equivalente, pero preserva mucho mejor la composicion de la imagen generada para un mismo prompt y semilla.

Es relevante para quienes quieren ejecutar text-to-image en un Mac sin GPU dedicada. Ahora bien, es una cuantizacion agresiva (4 bits con group scale de 64, ~4,25 bits por peso efectivos): el propio autor advierte de que el detalle es visiblemente mas blando que en 8 bits o en precision completa, y de que si se dispone de 0,8 GB extra conviene la variante mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) destilado a 9 pasos, 30 bloques transformer; inferencia via mflux sobre MLX |
| Parametros totales | 6,15B (transformer de difusion del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor no especifica el limite de tokens del text encoder) |
| Tipos de cuantizacion | 4 bits GPTQ con group scale de 64 (~4,25 bits/peso efectivos), formato MLX; el mismo autor publica variantes 8-bit y mixta (atencion 8-bit, feed-forward 4-bit) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el repo solo etiqueta `region:us`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, en el formato de checkpoint MLX de mflux (transformer + text encoder + VAE + tokenizer) |
| Tamano del repositorio | 5,9 GB en disco (~5,5 GB de pesos) |
| Pico de memoria en generacion | ~5,6 GB (MLX) |
| Pasos de inferencia | 9 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo base es Z-Image-Turbo, un diffusion transformer de 6,15B parametros con 30 bloques, destilado para generar en 9 pasos en lugar de las decenas habituales de un modelo de difusion no destilado. Esta ficha no cubre el entrenamiento del modelo base (los datos, la composicion del dataset y si hubo RLHF/DPO no se detallan en la informacion disponible); lo que describe el autor es exclusivamente el proceso de cuantizacion posterior.

Ese proceso, implementado en el repositorio zimage-quant, es GPTQ con correccion basada en el Hessiano: se capturan activaciones de las lineales de atencion y de feed-forward durante el bucle de denoising real del propio modelo, se aplica la correccion de error de GPTQ y los pesos corregidos se recuantizan y se insertan en el formato de checkpoint MLX de mflux, sin ningun cambio de formato respecto a `mflux-save --quantize 4`. El checkpoint resultante es, por tanto, intercambiable con el flujo de trabajo estandar de mflux y con herramientas que lo invocan, como LLMTray.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en 9 pasos de denoising.
- Inferencia local en Apple Silicon mediante MLX y mflux, sin GPU NVIDIA ni CUDA.
- Generacion reproducible: el autor documenta comparaciones con la misma semilla (42) y el mismo prompt entre cuantizaciones, de modo que el comportamiento es determinista y verificable.
- Integracion como herramienta dentro de un agente: LLMTray puede invocar `generate_image` a mitad de una conversacion y usar este repositorio como modelo de imagen de fondo.
- Conservacion de la composicion del modelo base notablemente mejor que la cuantizacion RTN de 4 bits equivalente (PSNR 17,1 dB frente a 16,6 dB tomando como referencia la salida de la version 8-bit).
- No se documentan capacidades de edicion de imagen, inpainting, control por pose, vision de entrada ni audio en la informacion disponible.
- No es un modelo de lenguaje: no hay tool calling, razonamiento multi-paso ni capacidades multilingues declaradas mas alla de las del text encoder del modelo base, que no se especifican.

## Casos de uso

- Generacion de imagenes por lotes en un Mac: el modelo cabe con un pico de ~5,6 GB de memoria unificada y 9 pasos por imagen, por lo que se puede ejecutar un pipeline de generacion masiva en portatiles y equipos de sobremesa Apple Silicon sin GPU dedicada.
- Creacion de ilustraciones para prototipos y mockups: al compartir prompt, semilla y 9 pasos con el resto de la familia Z-Image-Turbo, sirve para producir assets de forma reproducible en entornos de diseno que trabajan en macOS.
- Generacion de imagenes dentro de un asistente conversacional: integrarlo como modelo de imagen de LLMTray permite que el propio agente decida invocar `generate_image` a mitad de una conversacion.
- Entornos con memoria muy limitada: cuando el presupuesto de memoria es la restriccion principal (equipos de 8-16 GB de memoria unificada), esta es la variante de la familia que menos pico consume, a cambio de detalle mas blando.
- Flujos de trabajo offline o con requisitos de privacidad: al ejecutarse en local no requiere enviar prompts ni imagenes a servicios externos, lo que encaja en entornos con datos sensibles.
- Pruebas de concepto y evaluacion de cuantizaciones: es util para comparar GPTQ frente a RTN en un mismo prompt y semilla y decidir que variante desplegar antes de invertir en la de 8 bits o en la mixta.
- Generacion de borradores con posterior retoque: dado que el autor reconoce menor nitidez, encaja como paso de ideacion rapida cuya salida se refina despues con la version de 8 bits o con retoque manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU u otros) en la informacion disponible. El unico dato cuantitativo aportado por el autor es una comparacion de PSNR entre cuantizaciones, tomando la salida de la version 8-bit como referencia estable, con prompt, semilla (42) y 9 pasos identicos:

| Variante | PSNR frente a la referencia 8-bit | Pico de memoria | Tamano |
|---|---|---|---|
| GPTQ 4-bit (este repositorio) | 17,1 dB | ~5,6 GB | ~5,5 GB |
| RTN 4-bit (`mflux --quantize 4`) | 16,6 dB | no disponible | ~5,5 GB |
| GPTQ 8-bit | referencia | ~8,7 GB | no disponible |
| GPTQ mixto (atencion 8-bit, FF 4-bit) | no disponible | no disponible | ~6,3 GB |

El autor advierte explicitamente de que la diferencia de PSNR es modesta y que la senal relevante es cualitativa: con RTN a 4 bits, la generacion se desplaza a otra composicion y otro angulo de camara para un mismo prompt y semilla, mientras que GPTQ 4-bit se mantiene mucho mas cerca de la composicion de referencia. No hay datos de latencia, throughput ni de calidad medidos con metricas estandar.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante MLX; no hay soporte CUDA, ROCm ni CPU generica en este repositorio.
- Memoria: pico declarado de ~5,6 GB durante la generacion. Como estimacion a partir de ese dato, un equipo con 8 GB de memoria unificada queda muy al limite y 16 GB o mas es lo recomendable para trabajar con holgura.
- Almacenamiento: ~5,9 GB por el repositorio completo, con ~5,5 GB de pesos efectivos.
- Cabe en GPU de consumo: no aplica en el sentido habitual (no se ejecuta en RTX 4090 ni similares por la dependencia de MLX); el equivalente es cualquier Mac con memoria unificada suficiente.
- Despliegue: mflux mediante el comando `mflux-generate-z-image-turbo` apuntando a la ruta local del checkpoint, o LLMTray usando este repositorio como modelo de imagen. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El unico dato de coste computacional conocido es que la generacion se resuelve en 9 pasos de denoising.

Ejemplo de uso indicado por el autor:

```bash
pip install mflux
mflux-generate-z-image-turbo \
    --model /path/to/local/checkout/of/this/repo \
    --base-model z-image-turbo \
    --prompt "your prompt" --steps 9
```

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de la misma categoria fuera de la propia familia de cuantizaciones de Z-Image-Turbo, por lo que la comparativa se limita a esa familia.

| Variante | Cuantizacion | Tamano | Pico de memoria | Calidad relativa |
|---|---|---|---|---|
| Este repositorio (GPTQ 4-bit) | 4 bits, group scale 64 | ~5,5 GB | ~5,6 GB | Composicion cercana a la referencia, detalle mas blando |
| z-image-turbo-gptq-mlx-8bit | 8 bits | no disponible | ~8,7 GB | Referencia de estabilidad usada por el autor |
| z-image-turbo-gptq-mlx-mixed | Atencion 8 bits, FF 4 bits | ~6,3 GB | no disponible | Preserva mejor la composicion que el 4-bit uniforme; recomendada si se pueden asumir 0,8 GB extra |
| `mflux --quantize 4` (RTN) | 4 bits round-to-nearest | ~5,5 GB | no disponible | Deriva de composicion visible frente a la referencia (PSNR 16,6 dB) |
| Tongyi-MAI/Z-Image-Turbo | Precision completa | no disponible | no disponible | Modelo base, sin perdida por cuantizacion |

Frente a modelos de difusion de otras familias (Stable Diffusion, FLUX y similares), no hay datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva: 4 bits con group scale de 64, equivalente a ~4,25 bits por peso. El autor avisa de que el detalle es visiblemente mas blando que en 8 bits o en precision completa incluso con la correccion GPTQ.
- Deriva de composicion: en cuantizaciones de 4 bits el fallo tipico no es solo ruido, sino un cambio de composicion y de angulo de camara para un mismo prompt y semilla. La ventaja de GPTQ es reducir esa deriva, no eliminarla.
- PSNR poco concluyente: la mejora medida es de solo 0,5 dB (17,1 frente a 16,6), y el propio autor reconoce que la diferencia cualitativa entre imagenes es mas informativa que la cifra.
- Alternativa potencialmente mejor: si el presupuesto de memoria permite 0,8 GB adicionales, la variante mixta de 6,3 GB preserva mejor la composicion y puede ser mas estable para determinados prompts.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir anatomia incorrecta, texto ilegible o escenas incoherentes; la cuantizacion puede agravar estos artefactos.
- Idiomas: no declarados en la model card; no hay garantia documentada sobre el comportamiento con prompts en castellano.
- Sesgos: no se documenta ninguna evaluacion de sesgos del modelo base ni de esta cuantizacion.
- Licencia: apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Tongyi-MAI/Z-Image-Turbo, de las que este repositorio es un derivado.
- Madurez y soporte: repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta; no es una publicacion oficial de Tongyi-MAI y no hay garantia de mantenimiento.
- Dependencia de plataforma: atado a MLX y Apple Silicon; no es portable a otros entornos de inferencia sin reconvertir los pesos.
- Fechas: la model card indica una fecha de creacion posterior a la de esta ficha (2026-09-22), dato que se reproduce tal cual figura en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-4bit
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Version 8-bit del mismo autor: https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-8bit
- Version mixta del mismo autor: https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-mixed
- Codigo y metodo de cuantizacion: https://github.com/rromenskyi/quant-ternary/tree/main/zimage-quant
- mflux: https://github.com/filipstrand/mflux
- LLMTray: https://github.com/ipsupport-llc/llmtray
