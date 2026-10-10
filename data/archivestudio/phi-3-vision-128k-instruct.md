# ArchiveStudio/Phi-3-vision-128k-instruct

## Resumen

Phi-3-Vision-128K-Instruct es un modelo multimodal (texto e imagen) de pequeno tamano desarrollado originalmente por Microsoft dentro de la familia Phi-3. El repositorio analizado, `ArchiveStudio/Phi-3-vision-128k-instruct`, es una copia subida por un tercero (autor ArchiveStudio) del modelo oficial `microsoft/Phi-3-vision-128k-instruct`; no es una publicacion de Microsoft ni parece haber sido modificado, y registra 0 descargas y 0 "likes" en el momento de la consulta. Cuenta con aproximadamente 4.146 millones de parametros (4,15 B) y una longitud de contexto de 128.000 tokens.

El modelo combina un decodificador transformer de texto con un codificador visual, lo que le permite procesar una imagen junto con una instruccion en lenguaje natural y generar respuestas. Esta disenado para escenarios con restricciones de memoria y computo, entornos con requisitos de baja latencia y tareas de comprension de imagen, OCR y analisis de graficos y tablas. Su relevancia actual radica en ofrecer capacidades multimodales en un tamano que cabe en GPUs de consumo, con licencia MIT y formato safetensors.

Al tratarse de una copia de un modelo existente, la ficha debe interpretarse como una descripcion del modelo subyacente. Conviene verificar siempre el repositorio oficial de Microsoft antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador multimodal (etiqueta `phi3_v`) con codificador visual |
| Parametros totales | 4.146.621.440 (4,15 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en este repositorio (solo safetensors); Microsoft publica una version ONNX CUDA |
| Idiomas soportados | multilingual (declarado); la model card indica uso previsto principalmente en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 8,3 GB) |

## Arquitectura y entrenamiento

La model card describe un modelo multimodal ligero construido sobre la familia Phi-3. El componente de texto sigue el esquema de decodificador transformer caracteristico de Phi-3-mini y se acompana de un codificador visual; la etiqueta de arquitectura registrada en HuggingFace es `phi3_v`. El limite de contexto es de 128K tokens, coherente con la variante "vision" de la tabla de versiones de la familia Phi-3 (Mini, Small, Medium y Vision), donde Vision solo se ofrece en la configuracion larga de 128K.

Segun la informacion disponible, el entrenamiento combino datos sinteticos y contenido web publico filtrado, con enfasis en datos de alta calidad y densos en razonamiento, tanto para texto como para vision. El proceso de alineamiento incluyo ajuste supervisado (supervised fine-tuning) seguido de optimizacion por preferencias directas (direct preference optimization, DPO) para mejorar el seguimiento de instrucciones y las salvaguardas de seguridad. No se detallan en la model card el numero exacto de tokens de entrenamiento, la composicion pormenorizada del dataset ni el codificador visual concreto empleado.

## Capacidades

- Generacion de texto y razonamiento sobre contenido textual.
- Comprension de imagenes: descripcion de escenas y contenido visual general.
- OCR: extraccion de texto presente en imagenes.
- Comprension de graficos y tablas a partir de imagenes.
- Conversacion multiturno con formato de chat especifico que admite imagenes mediante el token `<|image_1|>`.
- Soporte multilingue declarado, aunque la model card circunscribe el uso previsto principal al ingles.
- Generacion de codigo: el modelo aparece etiquetado con `code` en HuggingFace, pero no se detallan capacidades especificas de programacion en la model card.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- La model card indica que esta pensado para una unica imagen de entrada por prompt.

## Casos de uso

- Digitalizacion y OCR de documentos: el modelo puede extraer texto de imagenes de facturas, formularios o documentos escaneados, aprovechando su capacidad de OCR y su contexto de 128K tokens para procesar instrucciones largas o documentos de varias paginas.
- Analisis de graficos y tablas para informes: util para convertir capturas de graficos o tablas en descripciones textuales o datos estructurados, reduciendo el trabajo manual en tareas de reporting.
- Descripcion de imagenes para accesibilidad: generar texto alternativo o descripciones para personas con discapacidad visual, dado su soporte de comprension de imagen y su tamano reducido para despliegue en servidores modestos.
- Asistentes en entornos con restricciones de computo: al ser un modelo de ~4 B de parametros, puede ejecutarse en hardware limitado o en el borde de la red, en escenarios con poca memoria o latencia estricta.
- Control de calidad visual en pipelines: analizar capturas de pantalla o imagenes en procesos de QA automatico, por ejemplo para detectar elementos ausentes o verificaciones visuales basicas.
- Extraccion de datos de imagenes para automatizacion: transformar el contenido de tickets, etiquetas o capturas en campos de texto reutilizables por otros sistemas.
- Enriquecimiento de bases de conocimiento: etiquetar y describir de forma automatica imagenes almacenadas, generando metadatos de texto para busqueda y catalogacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluida en el repositorio no aporta tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes. El informe tecnico oficial de Phi-3 (enlazado mas abajo) es la fuente recomendada para consultar resultados, aunque no forma parte de los datos proporcionados en esta busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 8,3 GB solo para los pesos (coincide con el tamano del repositorio).
- VRAM estimada en cuantizacion INT8/FP8: aproximadamente 4,2 GB para los pesos.
- VRAM estimada en cuantizacion INT4: aproximadamente 2,1-2,5 GB para los pesos.
- Cache KV: con contexto de 128K tokens el consumo de memoria de la cache puede crecer hasta decenas de GB segun la implementacion y el numero de secuencias; para uso practico conviene limitar la longitud de contexto o recurrir a tecnicas de atencion eficiente.
- Cabe en GPU de consumo con cuantizacion: modelos como RTX 3090, RTX 4090 (24 GB) o RTX 4080 pueden alojar el modelo en FP16 con margen, siempre que se gestione bien la cache.
- GPU recomendadas para produccion: A100, H100 o L40S si se necesita contexto largo o alto throughput.
- Opciones de despliegue documentadas en la model card: `transformers` (version de desarrollo 4.40.2, con `trust_remote_code=True` y `flash_attn==2.5.8`), ONNX Runtime (Microsoft publica versiones ONNX CUDA) y Azure AI Studio.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no disponible en la informacion proporcionada para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3-Vision-128K-Instruct (este repo) | 4,15 B | 128K | Texto e imagen | MIT | safetensors en este repositorio |
| Phi-3.5-vision-instruct (Microsoft) | no disponible en la informacion | 128K | Texto e imagen | MIT (segun repositorio oficial) | repositorio oficial de Microsoft |
| Phi-3-mini-instruct (Microsoft) | ~3,8 B (familia Phi-3) | 4K o 128K segun variante | Solo texto | MIT | repositorios oficiales |
| Alternativas multimodales de otros fabricantes (Qwen2-VL, LLaVA) | no disponible en la informacion | no disponible | Texto e imagen | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para esta ficha.

## Limitaciones y advertencias

- Repositorio no oficial: `ArchiveStudio/Phi-3-vision-128k-instruct` es una copia subida por un tercero, con 0 descargas y 0 "likes". Se recomienda usar el repositorio original de Microsoft para produccion.
- Idioma: aunque se declara multilingue, la model card indica que el uso previsto es principalmente en ingles; el rendimiento en castellano no esta evaluado en la informacion disponible.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones o lecturas de imagen incorrectas, especialmente en OCR con imagenes de baja calidad o en tablas densas.
- Sesgos: la model card advierte que los modelos no se evaluan especificamente para todos los casos de uso y que los desarrolladores deben evaluar y mitigar problemas de exactitud, seguridad y equidad.
- Entrada de imagen: segun la model card, esta optimizado para una unica imagen por prompt, lo que limita tareas que requieran comparar varias imagenes simultaneamente.
- Contexto: aunque soporta 128K tokens, el coste de memoria de la cache KV a esa longitud puede ser prohibitivo en hardware de consumo.
- Licencia: MIT permite uso comercial, pero al tratarse de una copia conviene confirmar la procedencia de los pesos y el cumplimiento de las condiciones originales de Microsoft.
- Evaluacion previa: la propia model card recomienda evaluar y mitigar riesgos antes de usar el modelo en escenarios de alto riesgo (salud, finanzas, legal, etc.).

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/ArchiveStudio/Phi-3-vision-128k-instruct
- Modelo oficial de Microsoft: https://huggingface.co/microsoft/Phi-3-vision-128k-instruct
- Licencia del modelo original: https://huggingface.co/microsoft/Phi-3-vision-128k-instruct/resolve/main/LICENSE
- Blog de Phi-3: https://aka.ms/Phi-3Build2024
- Informe tecnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/try-phi3vision
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Variantes Phi-3.5: mini-instruct, MoE-instruct y vision-instruct (enlazadas desde la model card en HuggingFace).
- Version ONNX CUDA de Microsoft: https://huggingface.co/microsoft/Phi-3-vision-128k-instruct-onnx-cuda
