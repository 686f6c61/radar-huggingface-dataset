# prithivMLmods/dots.mocr-GGUF

## Resumen

dots.mocr es un modelo multimodal de OCR y comprensión de documentos desarrollado por rednote-hilab, sucesor de dots.ocr. Está diseñado para unificar en un único marco tareas que tradicionalmente requerían sistemas separados: detección de layout, reconocimiento de contenido, parseo de gráficos estructurados, grounding visual, comprensión semántica y diálogo interactivo sobre documentos. El modelo se distribuye en formato GGUF por prithivMLmods, lo que permite ejecutarlo con llama.cpp en hardware modesto.

Con aproximadamente 1.800 millones de parámetros (el autor declara 3B, aunque el archivo safetensors indica 1.777.088.000), dots.mocr alcanza resultados competitivos frente a modelos especializados de tamaño similar y se acerca a sistemas mucho más grandes como Gemini 3 Pro. Su capacidad más distintiva es la conversión de gráficos estructurados —diagramas, interfaces de usuario, figuras científicas, fórmulas químicas y logotipos— directamente a código SVG. Soporta más de 100 idiomas y produce salidas JSON estructuradas con bounding boxes y categorías de layout, lo que lo hace adecuado para pipelines de automatización documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (detalles internos no disponibles) |
| Parametros totales | 1.777.088.000 (segun safetensors; el autor declara 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q3_K_L, Q3_K_M, Q3_K_S, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mas proyectores multimodales (mmproj) en BF16, F16 y Q8_0 |
| Idiomas soportados | Ingles, chino y mas de 100 idiomas (multilingue) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base tambien disponible en safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna (tipo de transformer, atencion, etc.) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que se conoce es que se trata de un modelo vision-language de aproximadamente 3B parametros que integra vision y lenguaje en un unico marco, y que incorpora un componente de vision capaz de generar SVG ademas de texto. El modelo base esta disponible en HuggingFace como dots-studio/dots.mocr, y esta version GGUF es una conversion para inferencia con llama.cpp. La inferencia tambien esta soportada oficialmente en vLLM desde la version v0.11.0.

## Capacidades

- OCR de documentos complejos: deteccion de layout, reconocimiento de tablas, formulas matematicas, texto en escenas y contenido mixto.
- Parseo de graficos estructurados a SVG: diagramas, interfaces de usuario, figuras cientificas, formulas quimicas y logotipos se convierten en codigo vectorial editable.
- Grounding visual: localizacion de elementos en la imagen con bounding boxes y categorias de layout en salida JSON estructurada.
- Comprension semantica y dialogo interactivo: permite hacer preguntas sobre el contenido del documento y mantener conversaciones multi-turno.
- Visual question answering (VQA) general sobre imagenes.
- Web parsing: extraccion de contenido estructurado de paginas web capturadas como imagen.
- Scene text spotting: deteccion y reconocimiento de texto en entornos naturales (carteles, senales, etc.).
- Multilingue: soporte para mas de 100 idiomas en documentos.

## Casos de uso

- Digitalizacion de documentos administrativos: el modelo extrae campos de facturas, contratos y formularios en formato JSON estructurado, listo para integrarse en sistemas ERP o CRM sin intervencion manual.
- Conversion de graficos cientificos a SVG: investigadores pueden convertir figuras de papers, diagramas de flujo o estructuras quimicas en codigo vectorial editable para reutilizarlos en nuevas publicaciones.
- Automatizacion de procesos de negocio: extraccion de datos de capturas de pantalla de aplicaciones o paneles de control, con bounding boxes que permiten validar la posicion de cada campo extraido.
- Asistente conversacional sobre documentos: un chatbot que responde preguntas sobre un PDF escaneado o una imagen, gracias a la capacidad de dialogo multi-turno y comprension semantica.
- Accesibilidad: lectura de documentos escaneados para personas con discapacidad visual, generando descripciones textuales estructuradas y navegables por secciones.
- Analisis de interfaces de usuario: disenadores y desarrolladores pueden convertir capturas de UI en codigo SVG para prototipado rapido o documentacion tecnica.
- Indexacion y busqueda semantica: al convertir documentos en JSON estructurado con categorias de layout, se puede indexar contenido para busqueda por tipo de elemento (tabla, formula, grafico) en grandes repositorios.

## Benchmarks y rendimiento

Segun la model card del autor, el modelo alcanza los siguientes resultados en benchmarks publicos:

| Benchmark | Resultado |
|---|---|
| olmOCR-bench | 83,9 % |
| UniSVG (modelo companion dots.mocr-svg) | 0,902 |
| ChartMimic (modelo companion dots.mocr-svg) | 0,905 |
| ChemDraw (modelo companion dots.mocr-svg) | 0,901 |

Tambien se menciona que supera a modelos especializados como MonkeyOCR-pro-3B, GLM-OCR, PaddleOCR-VL-1.5 y HuanyuanOCR en OmniDocBench (v1.5) y XDocParse, aunque no se proporcionan cifras comparativas numericas. Se indica que se acerca al rendimiento de Gemini 3 Pro, un modelo mucho mayor.

## Requisitos de hardware

- VRAM estimada: segun datos de LocalAI, aproximadamente 2 GB con cuantizacion Q4_K_M, 4 GB con Q8_0 y 7 GB con FP16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para cuantizaciones bajas (por ejemplo, GTX 1650, RTX 3050); para FP16 se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4060, etc.).
- Compatibilidad con consumer GPU: si, gracias a los formatos GGUF cuantizados.
- Opciones de despliegue: llama.cpp (compatible con el formato GGUF), vLLM (desde v0.11.0), HuggingFace Transformers (modelo base safetensors), y herramientas como Ollama si se convierte el GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numericos comparativos publicados para modelos de la misma categoria (MonkeyOCR-pro-3B, GLM-OCR, PaddleOCR-VL-1.5, HuanyuanOCR). La model card afirma superioridad cualitativa sobre ellos, pero sin cifras. El modelo mas comparable en tamano es MonkeyOCR-pro-3B (tambien 3B), aunque no hay benchmarks cruzados disponibles. En cuanto a licencia, dots.mocr es MIT, lo que lo diferencia de alternativas con licencias mas restrictivas, aunque esto no puede confirmarse para los modelos mencionados.

## Limitaciones y advertencias

- No se han publicado limitaciones especificas por parte del autor (sesgos, casos de fallo conocidos, etc.).
- Al ser un modelo OCR, existe riesgo de alucinacion en textos poco legibles, imagenes de baja resolucion o fuentes no estandar.
- La longitud de contexto no esta documentada; para documentos muy largos puede ser necesario dividir la entrada en fragmentos.
- El rendimiento en idiomas distintos de ingles y chino no esta cuantificado, aunque se declara soporte para mas de 100 idiomas.
- La version GGUF requiere el archivo de proyector multimodal (mmproj) para funcionar correctamente con llama.cpp; omitirlo provoca errores de inferencia.
- El modelo companion dots.mocr-svg (especializado en generacion de SVG) no esta incluido en este repositorio; para esa tarea concreta puede ser necesario usar el modelo base.
- No se han publicado resultados de benchmarks para la version GGUF cuantizada; el rendimiento puede degradarse ligeramente con cuantizaciones bajas (Q3).

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/prithivMLmods/dots.mocr-GGUF
- Modelo base en HuggingFace: https://huggingface.co/dots-studio/dots.mocr
- Repositorio GitHub del proyecto: https://github.com/studio-dots-ai/dots.mocr
- Pagina de compatibilidad de hardware (LocalAI): https://localai.computer/models/dots-studio-dots.mocr
- Perfil del autor de la conversion GGUF: https://huggingface.co/prithivMLmods
