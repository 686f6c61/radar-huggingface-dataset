# ayanoby/hexanima-ltx-packs

## Resumen

HexAnima LTX Packs es un paquete de pesos convertidos del modelo de generación de vídeo LTX-2.5 de Lightricks (variante destilada de 22B, solo vídeo) para su ejecución en la NPU Hexagon v69 de los SoC Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1. El autor, ayanoby, publica los ficheros que consume su propia aplicación Android (HexAnima), no un modelo autónomo: el paquete incluye el codificador de texto basado en Gemma-4, el transformer de difusión (DiT), los conectores, el decodificador VAE y el codificador de imagen, todo en formatos QNN específicos del Hexagon. El objetivo es llevar generación texto-a-vídeo e imagen-a-vídeo de 8 pasos y hasta 97 fotogramas (unos 4 segundos) a teléfonos de gama alta de 2022.

La relevancia del proyecto es de nicho pero técnicamente interesante: demuestra la viabilidad de ejecutar un modelo de difusión de vídeo de 22B parámetros en un dispositivo móvil mediante streaming de pesos desde el almacenamiento flash en cada paso de inferencia, lo que evita mantener el DiT completo en memoria. El repositorio ocupa 30,5 GB y está etiquetado como image-to-video, aunque el autor indica que cubre también texto-a-vídeo. No se trata de un modelo entrenado desde cero ni de un fine-tune convencional, sino de una conversión de formato de un modelo existente.

La licencia es la LTX-2.x Community License Agreement, que impone restricciones de uso y una política de uso aceptable que se aplican a cualquiera que reciba estos ficheros. El autor declara explícitamente que los ficheros no son utilizables con otras herramientas distintas de su aplicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo, con codificador de texto Gemma-4 y decodificador VAE; conversión a contextos QNN para NPU Hexagon |
| Parámetros totales | 22B (modelo base LTX-2.5 destilado, solo vídeo) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (generación de hasta 97 fotogramas, unos 4 s de vídeo) |
| Tipos de cuantización | no disponible (pesos convertidos a formatos QNN para Hexagon v69; no se detalla precisión) |
| Idiomas soportados | no disponible (el codificador de texto es Gemma-4, pero no se especifican idiomas) |
| Licencia | LTX-2.x Community License Agreement (con restricciones de uso y política de uso aceptable) |
| Formato de pesos | Contextos QNN específicos de Hexagon v69; no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: convierte el LTX-2.5 22B destilado de Lightricks, que combina un transformer de difusión para vídeo con un codificador de texto basado en Gemma-4, a formatos ejecutables en la NPU Hexagon v69. La conversión incluye el codificador de texto (11 GB), el DiT (13 GB), los conectores (1,6 GB), el decodificador VAE y el codificador de imagen (1,1 GB en contextos QNN) y el tokenizador. El DiT se ejecuta con streaming de pesos desde el flash en cada paso, lo que permite que un modelo de 13 GB funcione en un dispositivo con memoria limitada.

El modelo base es una variante destilada, lo que explica la inferencia en 8 pasos. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a LTX-2.5 y no se detallan en la model card proporcionada. La innovación técnica destacable es precisamente la ingeniería de despliegue: partición del modelo en componentes, conversión a contextos QNN y streaming de pesos para encajar en la NPU móvil.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en 8 pasos de inferencia.
- Generación de vídeo a partir de imagen (image-to-video), pipeline declarado en Hugging Face.
- Generación de 17 a 97 fotogramas (aproximadamente 4 segundos de vídeo).
- Resolución y tamaño configurables según la memoria disponible del teléfono.
- Codificación de texto mediante Gemma-4 para las indicaciones.
- Ejecución en NPU Hexagon v69 (Snapdragon 8 Gen 1 / 8+ Gen 1) mediante la app HexAnima.
- No se documentan tool calling, function calling, agentes ni modo thinking; no aplica a un modelo de difusión de vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de vídeo corto en dispositivo: un usuario escribe una indicación y obtiene un clip de hasta 4 segundos directamente en el teléfono, sin subir datos a la nube, gracias a la ejecución local en la NPU Hexagon.
- Animación de fotos para redes sociales: a partir de una imagen fija (image-to-video) se genera una animación breve de 17 a 97 fotogramas, adecuada para publicaciones en móvil.
- Prototipado offline: desarrolladores que prueban ideas de vídeo generativo en entornos sin conectividad o con requisitos de privacidad, usando el paquete con la app HexAnima.
- Demostración e investigación en eficiencia de despliegue: el proyecto sirve como referencia para estudiar streaming de pesos y conversión a QNN en NPU móviles.
- Creación de contenido efímero en dispositivos de gama alta de 2022: propietarios de Snapdragon 8 Gen 1 / 8+ Gen 1 pueden experimentar con generación de vídeo local sin hardware dedicado.
- Evaluación de la viabilidad de modelos de difusión de vídeo de gran tamaño en el borde: útil para equipos que valoran arquitecturas de streaming frente a recortes de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU Hexagon v69, presente en Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1.
- Almacenamiento: el repositorio ocupa 30,5 GB; el DiT (13 GB) se lee desde flash en cada paso, por lo que se recomienda almacenamiento rápido (UFS) y espacio libre suficiente.
- Memoria: el codificador de texto (11 GB) y el DiT (13 GB) no se mantienen completos en memoria simultáneamente según el esquema de streaming descrito; el tamaño de vídeo posible depende de la memoria del teléfono.
- No cabe en GPU de consumo convencional mediante los formatos publicados: los ficheros son contextos QNN y el autor indica que no son utilizables con otras herramientas.
- Despliegue: exclusivamente mediante la aplicación HexAnima (https://github.com/ayanoby/hexanima); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que la inferencia se realiza en 8 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| HexAnima LTX Packs (este) | 22B (base LTX-2.5) | hasta 97 fotogramas (~4 s), 8 pasos | LTX-2.x Community License | Solo con app HexAnima en Hexagon v69 |
| Lightricks LTX-2.5 (base) | 22B | no disponible en esta ficha | LTX-2.x Community License | Hugging Face, uso general en GPU |
| Alternativas de vídeo open source de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros son específicos para la NPU Hexagon v69 y la app HexAnima; no funcionan con otras herramientas ni en GPU estándar.
- El modelo base es destilado y solo vídeo; no se documentan capacidades de audio ni otras modalidades.
- La licencia LTX-2.x Community License Agreement incluye restricciones de uso y una política de uso aceptable que vinculan a cualquier receptor de los ficheros; es necesario revisar `LICENSE` y `NOTICE.md` antes de un uso comercial.
- Es un derivado modificado (convertido) de LTX-2.x; el proyecto es independiente y no está afiliado a Lightricks ni a Google.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base de generación de vídeo.
- Idiomas soportados y calidad multilingüe: no disponibles.
- El streaming de pesos desde flash puede implicar latencias elevadas y desgaste del almacenamiento; no se aportan cifras.
- La duración máxima de vídeo (~4 s) limita los casos de uso que requieran clips más largos.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-ltx-packs
- Aplicación HexAnima: https://github.com/ayanoby/hexanima
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: fichero `LICENSE` del repositorio
- Aviso de derivado: fichero `NOTICE.md` del repositorio
