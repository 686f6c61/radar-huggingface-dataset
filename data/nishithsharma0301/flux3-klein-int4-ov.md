# nishithsharma0301/flux3-klein-int4-ov

## Resumen

FLUX 3 Image Klein es un modelo de generación y edición de imágenes desarrollado por Black Forest Labs, distribuido originalmente en Hugging Face como `black-forest-labs/flux-3-image-klein`. Esta ficha describe la conversión a OpenVINO INT4 publicada por el usuario nishithsharma0301 bajo el identificador `nishithsharma0301/flux3-klein-int4-ov`, una build de terceros orientada a inferencia en hardware Intel (iGPU), no una versión oficial del modelo.

La conversión cuantiza a INT4 asimétrico (group size 128) el transformer de difusión —tanto en su forma text-to-image como en la de edición con una imagen de referencia— y el codificador de texto Qwen3-VL 4B, mientras que el codificador y decodificador VAE se mantienen en FP16. El objetivo es reducir el peso y hacer viable la ejecución en GPUs integradas Intel mediante OpenVINO 2026.4.1 y NNCF 3.4.0, con un repositorio de 8,1 GB.

El modelo resuelve dos tareas: generación de imágenes a partir de texto y edición de imágenes con una referencia. Es relevante para quienes necesitan desplegar FLUX 3 Klein en entornos Intel sin GPU discreta, aunque su licencia FLUX Kommunity v1.0 limita el uso comercial y la build no cuenta con validación de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX 3 Image Klein) con codificador de texto Qwen3-VL 4B, convertido a OpenVINO |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimétrico, group size 128 (transformer y text encoder); FP16 (VAE encoder/decoder) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License v1.0 (uso no comercial; generación comercial permitida a Qualifying Users). El text encoder Qwen3-VL es Apache 2.0 |
| Formato de pesos | OpenVINO IR (modelos OpenVINO); tokenizer como modelo OpenVINO; repo de 8,1 GB |
| Pasos de inferencia | 8 pasos |
| Runtime | OpenVINO 2026.4.1, NNCF 3.4.0; motor C++ propio de LESI |
| Commit base | `09561231f44e41381c461caf53d5452005a60ac9` de `black-forest-labs/flux-3-image-klein` |

## Arquitectura y entrenamiento

La build parte del modelo `black-forest-labs/flux-3-image-klein` en el commit indicado y lo convierte a OpenVINO mediante el script `scripts/image-model/build_flux3_klein.ps1` del proyecto LESI. La conversión afecta al transformer de difusión (en sus dos variantes: text-to-image y edición con una referencia) y al codificador de texto Qwen3-VL 4B, que se recorta tras la capa 32 y apila las capas 4–32. Ambos se cuantizan a INT4 asimétrico con group size 128; el VAE se mantiene en FP16 y el tokenizer se exporta como modelo OpenVINO.

No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre innovaciones de decodificación. La información disponible se limita al proceso de conversión y cuantización. La inferencia se realiza con el motor C++ propio de LESI sobre una iGPU Intel, procesando una parte del pipeline a la vez y con 8 pasos de muestreo. Los ficheros `flux3_recipe.txt` y `tokenizer/chat_*.txt` contienen los artefactos auxiliares necesarios además de los modelos.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image).
- Edición de imágenes con una imagen de referencia (one-reference edit).
- Codificación de texto mediante Qwen3-VL 4B recortado (capas 4–32, hasta la capa 32).
- Ejecución en hardware Intel mediante OpenVINO, con soporte para iGPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, audio ni otros modos.

## Casos de uso

- Generación de ilustraciones y concept art en estación de trabajo con iGPU Intel: el pipeline OpenVINO INT4 permite ejecutar el modelo sin GPU discreta, procesando una parte a la vez para ajustarse a la memoria disponible.
- Edición de imágenes con referencia en flujos de diseño: la variante one-reference permite aplicar el estilo o contenido de una imagen de entrada, útil para variaciones controladas de un diseño base.
- Prototipado de pipelines de difusión en entornos OpenVINO: sirve para validar la integración de un transformer FLUX 3 con el runtime de Intel antes de invertir en hardware dedicado.
- Experimentación académica con cuantización INT4: la build permite estudiar el impacto de la cuantización asimétrica (group size 128) en la calidad de imagen frente al modelo original en FP16.
- Evaluación de motores C++ de inferencia: el repositorio incluye la receta y los artefactos del motor de LESI, lo que facilita reproducir y comparar el rendimiento en iGPU.
- Docencia y demos locales de text-to-image: al caber en 8,1 GB y ejecutarse en iGPU, es adecuado para talleres donde no se dispone de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 8,1 GB y la inferencia se describe sobre iGPU Intel, por lo que se requiere memoria compartida suficiente para cargar las partes del pipeline de forma secuencial.
- GPU recomendadas: iGPU Intel (entorno objetivo declarado por el autor); no se especifican modelos concretos.
- Compatibilidad con GPU consumer: no confirmada; el autor no documenta pruebas en RTX 4090, A100 ni H100.
- Opciones de despliegue: OpenVINO 2026.4.1 con NNCF 3.4.0 y el motor C++ propio de LESI; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nishithsharma0301/flux3-klein-int4-ov | no disponible | no disponible | OpenVINO IR INT4/FP16 | FLUX Kommunity v1.0 | Build de terceros para iGPU Intel, 8 pasos |
| black-forest-labs/flux-3-image-klein | no disponible | no disponible | no disponible | FLUX Kommunity v1.0 | Modelo original de Black Forest Labs |
| Otras builds OpenVINO de FLUX | no disponible | no disponible | OpenVINO IR | según modelo base | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La licencia FLUX Kommunity v1.0 restringe el uso comercial: solo los Qualifying Users pueden generar output comercial según sus términos; el text encoder Qwen3-VL es Apache 2.0.
- Build de terceros sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia pública de calidad frente al modelo original.
- La cuantización INT4 puede degradar la fidelidad de las imágenes respecto al modelo en FP16; no se aportan métricas que lo cuantifiquen.
- El recorte del text encoder (capas 4–32, hasta la capa 32) puede alterar la comprensión de prompts complejos; no se documenta su impacto.
- Riesgo de alucinación visual y de sesgos heredados del dataset de entrenamiento original, no documentados en esta build.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe.
- Dependencia de versiones concretas de OpenVINO (2026.4.1) y NNCF (3.4.0), y de artefactos auxiliares (`flux3_recipe.txt`, `tokenizer/chat_*.txt`) para la ejecución.
- No se documentan requisitos de memoria, latencia ni compatibilidad con GPU discretas.

## Enlaces

- Hugging Face: https://huggingface.co/nishithsharma0301/flux3-klein-int4-ov
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Commit base: `09561231f44e41381c461caf53d5452005a60ac9`
- Licencia: LICENSE.md en el repositorio
- Checksums: SHA256SUMS en el repositorio
- Script de build: `scripts/image-model/build_flux3_klein.ps1` (proyecto LESI, referenciado en la model card)
