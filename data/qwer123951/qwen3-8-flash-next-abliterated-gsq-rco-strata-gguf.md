# QWER123951/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF es un kit de despliegue comunitario publicado por el usuario QWER123951 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una recopilación de los ficheros GGUF cuantizados con GSQ-RCO de Qwen3.8-Flash-Next (realizados por el laboratorio ISTA-DASLab), copiados byte a byte del repositorio original, más un archivo adicional de 480 KB que contiene un vector de control de dirección de rechazo (refusal direction) extraído del checkpoint abliterated de Huihui-ai.

El propósito del repositorio es permitir ejecutar una versión "abliterated" (sin rechazos de seguridad) del modelo en una GPU de consumo, aplicando el vector de dirección en tiempo de ejecución mediante el motor Strata, en lugar de modificar los pesos. Esto permite alternar entre el modelo original y la versión sin filtros con un simple flag de configuración. El modelo base es multimodal (image-text-to-text) y el repositorio incluye el proyector de visión en BF16.

El modelo base Qwen3.8-Flash-Next, desarrollado por el equipo de Qwen, tiene 120.320 millones de parámetros (dato real de safetensors) y utiliza una arquitectura MoE con decodificación especulativa MTP (Multi-Token Prediction). El repositorio incluye cuatro cuantizaciones: Q2_0, IQ2_XS, IQ3_XXS e IQ3_S, con tamaños entre 66,4 y 83,6 GB, pensadas para ejecutarse con Strata en tarjetas NVIDIA o AMD con 12 GB o más de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MTP (Multi-Token Prediction), multimodal (image-text-to-text) |
| Parametros totales | 120.320 millones (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (referencias a prompts de hasta 131K tokens en las mediciones) |
| Tipos de cuantizacion | Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw), todas GSQ-RCO |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (other) |
| Formato de pesos | GGUF (2 shards por tamaño, shard 2 es tabla de n-gramas compartida) + mmproj BF16 para visión |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE multimodal desarrollado por el equipo de Qwen. El repositorio no detalla la arquitectura interna completa, pero se sabe que utiliza decodificación especulativa mediante una capa MTP (Multi-Token Prediction) de unos 6 GB extraída del checkpoint original de Qwen, que Strata descarga durante la instalación. El proyector de visión se distribuye en BF16 (mmproj-Qwen3.8-Flash-Next-BF16.gguf).

Los pesos han sido cuantizados por ISTA-DASLab mediante dos técnicas publicadas en papers de arXiv: GSQ (arxiv:2604.18556) y RCO (arxiv:2605.00649), que producen cuantizaciones de muy bajo bit (2-3,5 bits por peso) con mayor fidelidad que las cuantizaciones GGUF convencionales. El shard 2 de cada tamaño es una tabla de n-gramas (idéntica en los cuatro tamaños) usada por el motor para acelerar la decodificación.

La innovación central de este fork es la abliteración en tiempo de ejecución: en lugar de editar los pesos como hace Huihui-ai (que modificó 144 tensores de escritura residual con una edición de rango uno a lo largo de una dirección unitaria `r`), este repositorio aplica la proyección `h = h - (h . r) r` sobre el residual stream tras cada capa dirigida, mediante el motor Strata. Difiere del enfoque de Huihui en dos puntos: Strata proyecta el stream completo (incluyendo contribuciones de embeddings y n-gramas) y la capa 0 no puede ser dirigida. No hay datos sobre entrenamiento adicional, RLHF/DPO ni composición del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base Qwen3.8-Flash-Next
- Comprensión de imágenes: pipeline image-text-to-text, con proyector de visión BF16 incluido y soporte de visión en GPU en Strata
- Versión abliterated: elimina los rechazos de seguridad del modelo mediante proyección de dirección de rechazo en runtime
- Modo dual: con `"experimental_speed_projection": false` se ejecuta el modelo original sin steered layers
- Compatibilidad con clientes OpenAI (`/v1`) y Anthropic (`/v1/messages`) mediante el servidor de Strata
- Decodificación especulativa MTP y tabla de n-gramas para acelerar la inferencia
- Tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada

## Casos de uso

- Ejecución local en GPU de consumo de un modelo multimodal de 120B sin filtros de rechazo: Strata permite correr las cuantizaciones IQ2_XS o Q2_0 en una máquina con 48 GB de RAM y una GPU de 12+ GB de VRAM.
- Investigación sobre abliteración y steering: el vector de dirección puede aplicarse en runtime con distintas configuraciones de capas (probadas 4-44 y 1-47), útil para estudiar el efecto de la dirección de rechazo sin reescribir pesos.
- Análisis de imágenes con prompts largos: se han medido decodificaciones con prompts de hasta 131K tokens, adecuado para tareas de visión con documentos extensos.
- Servidor local compatible con ecosistemas existentes: expone endpoints OpenAI y Anthropic, lo que permite integrarlo en aplicaciones que ya usan esos SDK.
- Comparación de cuantizaciones GSQ-RCO: el repositorio incluye mediciones de KL divergence y coincidencia top-1 frente al modelo BF16, útil para evaluar la degradación por cuantización.
- Generación de contenido sin filtros para casos legítimos (investigación de seguridad, red teaming, ficción adulta): la abliteración elimina los rechazos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las mediciones incluidas son de rendimiento y fidelidad de cuantización, realizadas por el autor del repositorio en una RTX 3090:

| Size | Bits por peso | Descarga | Expertos en RAM | KL a BF16 Huihui | Top-1 igual a BF16 | Decode con prompt de 32K |
|---|---:|---:|---:|---:|---:|---:|
| Q2_0 | 2,40 | 66,4 GB | 34 GB | no medido | no disponible | no disponible |
| IQ2_XS | 2,50 | 68,0 GB | 35,5 GB | 0,193 | 88% | 87 tokens/s |
| IQ3_XXS | 3,00 | 75,8 GB | 43 GB | no medido | no disponible | no disponible |
| IQ3_S | 3,50 | 83,6 GB | 50 GB | 0,075 | 93% | 59 tokens/s |

Entre las dos cuantizaciones medidas, IQ3_S se mantiene más cercana al modelo completo, mientras que IQ2_XS decodifica un 45-70% más rápido en prompts de hasta 131K tokens. ISTA-DASLab describe Q2_0 como la más rápida de las cuatro. Para benchmarks propios del modelo base, el autor remite al repositorio de ISTA-DASLab.

## Requisitos de hardware

- VRAM: GPU NVIDIA o AMD con 12 GB o más (requisito mínimo de Strata); el modelo se ejecuta con expertos en RAM y el resto en GPU (offloading híbrido)
- RAM del sistema: 48 GB para Q2_0 e IQ2_XS; 64 GB para IQ3_XXS e IQ3_S (según la página de Strata)
- GPU de referencia en las mediciones: RTX 3090 (87 tokens/s con IQ2_XS y 59 tokens/s con IQ3_S en prompts de 32K)
- Consumer GPUs: viable en tarjetas de gama alta de consumo (RTX 3090/4090) gracias al esquema de expertos en RAM; no cabe íntegramente en VRAM de consumo
- Despliegue: Strata (motor dedicado con proyección de control vector, servidor en `http://127.0.0.1:8080`); los GGUF también cargan en llama.cpp, pero su `--control-vector` estándar añade un vector en lugar de proyectarlo, por lo que el efecto abliterated no es equivalente
- Requisitos adicionales: descarga de la capa MTP draft (~6 GB) durante el setup; el instalador de Windows es `START-HERE.bat`
- Latencia y throughput: 87 tokens/s (IQ2_XS) y 59 tokens/s (IQ3_S) en decodificación con prompt de 32K en RTX 3090; no hay más datos de latencia

## Comparativa con modelos similares

| Característica | Este repo (Strata kit) | Huihui-Qwen3.8-Flash-Next-abliterated | ISTA-DASLab GSQ-RCO GGUF | EXL3 4bit (alesha-pro) |
|---|---|---|---|---|
| Formato | GGUF + vector de control runtime | Pesos abliterated (144 tensores editados) | GGUF GSQ-RCO (modelo original) | EXL3 4-bit HQ |
| Abliteración | En runtime, reversible (flag) | Horneada en los pesos, irreversible | No abliterated | Horneada en los pesos |
| Cuantizaciones | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | no disponible | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | 4-bit |
| Requiere Strata | Sí (para el efecto completo) | No | No | No (requiere exllamav3) |
| Fidelidad medida | KL 0,075 (IQ3_S) / 0,193 (IQ2_XS) vs BF16 Huihui | Referencia BF16 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterated: elimina las salvaguardas de seguridad del modelo base. Su uso conlleva riesgos éticos y legales; el usuario es responsable del contenido generado.
- Licencia qwen-community-license-1.0: revisar los términos antes de cualquier uso comercial; la licencia "other" de Qwen puede incluir restricciones según el número de usuarios o el volumen de uso.
- La abliteración por proyección difiere de la edición de pesos de Huihui: proyecta el stream completo (incluidos embeddings y n-gramas) y la capa 0 no puede dirigirse, por lo que el comportamiento no es idéntico al checkpoint de Huihui.
- Solo IQ3_S e IQ2_XS han sido medidas por el autor; Q2_0 e IQ3_XXS se distribuyen tal cual publicó ISTA-DASLab, sin mediciones propias.
- El autor no ejecutó el instalador de principio a fin en su máquina; construyó el motor desde el código fuente fijado y lo arrancó con los mismos argumentos que escribe el setup.
- Cuantizaciones agresivas (2-2,5 bits): KL de 0,193 y 88% de coincidencia top-1 en IQ2_XS indican degradación perceptible frente al modelo BF16.
- llama.cpp estándar no reproduce el efecto abliterated: su `--control-vector` suma un vector, no proyecta.
- Sesgos, alucinaciones, limitaciones de idioma y contexto del modelo base: no disponible en la información proporcionada; consultar la model card de Qwen/Qwen3.8-Flash-Next.

## Enlaces

- Repositorio del modelo: https://huggingface.co/QWER123951/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Modelo base cuantizado: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código RCO: https://github.com/IST-DASLab/RCO
- Motor Strata: https://github.com/Niko1221/Strata
- Cuantizaciones EXL3 del mismo modelo: https://huggingface.co/alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6
