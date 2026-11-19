# openbmb/MiniCPM-OCR-1.0-gguf

## Resumen

MiniCPM-OCR 1.0 es un modelo multimodal especializado en el parseo de documentos, desarrollado por OpenBMB (grupo de investigacion de la Universidad de Tsinghua). Convierte imagenes de documentos y PDFs en texto estructurado, tablas, formulas, graficos y sellos, y soporta extraccion de informacion clave. Este repositorio aloja exclusivamente la build GGUF del modelo para su uso con llama.cpp; los pesos originales y la model card completa residen en el repositorio base MiniCPM-OCR-1.0.

El modelo parte de MiniCPM-V-4.6 como base y se ha especializado mediante el pipeline `minicpm-ocr`. Cuenta con 752.167.744 parametros (aproximadamente 1,3B segun la model card) y esta disenado para ejecutarse en entornos con recursos limitados, incluyendo despliegue on-device en iOS. Su relevancia actual radica en que ofrece parseo documental de calidad en un paquete de menos de 1 GB en cuantizacion Q4_K_M, con licencia Apache 2.0 y soporte para ingles y chino.

La arquitectura de parseo es un pipeline de dos etapas: deteccion de layout con PP-DocLayoutV3 (ejecutado localmente en el entorno del SDK) y reconocimiento de regiones mediante MiniCPM-OCR 1.0 servido por vLLM, SGLang, llama.cpp u Ollama. El SDK `minicpm-ocr` orquesta ambas etapas y ensambla la salida en Markdown o JSON respetando el orden de lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de MiniCPM-V-4.6; proyector visual con downsample 4x |
| Parametros totales | 752.167.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector visual separado `mmproj-model-f16-4x.gguf`) |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 es un modelo transformer multimodal construido sobre MiniCPM-V-4.6, especializado en reconocimiento y parseo de documentos. El componente visual utiliza un proyector con factor de downsample 4x (unico disponible para este modelo; no existe variante 16x). El pipeline completo separa la deteccion de layout (PP-DocLayoutV3, basado en PaddlePaddle/PaddleX) del reconocimiento de regiones (MiniCPM-OCR 1.0), lo que permite ejecutar cada etapa en entornos o maquinas distintas y escalar el servicio de reconocimiento de forma independiente.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card referencia la guia del modelo en GitHub para obtener mas detalles sobre arquitectura y flujo de parseo.

## Capacidades

- Parseo de documentos completos en texto plano, tablas, formulas, graficos y sellos.
- Extraccion de informacion clave (key information extraction) de documentos en chino e ingles.
- Conversion de PDFs e imagenes a Markdown o JSON estructurado respetando el orden de lectura.
- Deteccion de layout y recorte de regiones mediante PP-DocLayoutV3 integrado en el SDK.
- Prompt especifico por tipo de region (texto, tabla, formula, grafico, sello) para adaptar el reconocimiento.
- Soporte multilingue limitado a ingles y chino.
- Despliegue on-device y offline en iOS (el parseo documental en movil es solo para iOS por ahora).
- Compatible con endpoints estandar (tag `endpoints_compatible`) y con el SDK oficial `minicpm-ocr` en Python y CLI.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el pipeline de dos etapas permite procesar lotes de documentos escaneados, detectando regiones con PP-DocLayoutV3 y enviando cada recorte al servicio MiniCPM-OCR para obtener Markdown o JSON estructurado. Adecuado por su bajo coste de inferencia y su tamano reducido en Q4_K_M (0,529 GB).
- Extraccion de datos de facturas y formularios: el modelo soporta key information extraction en ingles y chino, lo que permite extraer campos estructurados de documentos administrativos y volcarlos a bases de datos.
- Conversion de documentacion tecnica con formulas: el reconocimiento de formulas matematicas y su ensamblado en Markdown facilita la migracion de papers y manuales tecnicos a formatos editables.
- Procesamiento de tablas financieras: con la cuantizacion Q8_0 o Q4_K_M (esta ultima sin perdida en tablas segun la model card), se pueden extraer tablas de informes y balances manteniendo la estructura.
- Digitalizacion de documentos con sellos oficiales: la deteccion y reconocimiento de sellos permite validar y catalogar documentos legales o administrativos que incorporan estampados.
- Despliegue en dispositivos moviles sin conexion: la app iOS oficial permite parsear documentos localmente sin enviar datos a la nube, util para entornos con requisitos de privacidad estrictos.
- Automatizacion de flujos RPA documentales: al exponerse via vLLM, SGLang, llama.cpp u Ollama con una API HTTP, se integra en pipelines de automatizacion que requieren extraccion de contenido estructurado en tiempo casi real.
- Archivado y busqueda de documentos historicos: la conversion a Markdown/JSON en orden de lectura permite indexar el contenido para motores de busqueda internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la guia del modelo en GitHub para consultar desgloses de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en F16 (1,516 GB de pesos) mas el proyector visual (0,901 GB), lo que suma unos 2,4 GB en F16; en Q4_K_M los pesos son 0,529 GB y el total ronda 1,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar la variante Q4_K_M; para F16 se recomienda al menos 6 GB. No se requiere A100/H100 para inferencia individual, aunque para servir lotes concurrentes conviene una GPU con mayor memoria.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien en hardware integrado y movil (demo iOS).
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama e imagen Docker oficial. El SDK `minicpm-ocr` orquesta el pipeline y puede apuntar a un servicio de inferencia remoto por HTTP.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (este) | 752.167.744 | no disponible | en, zh | Apache 2.0 | GGUF, safetensors (repo base) | Especializado en parseo documental con pipeline de dos etapas |
| MiniCPM-V-4.6 (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Modelo multimodal general del que deriva; no especializado en OCR |
| MiniCPM-OCR 1.0-DSpark | no disponible | no disponible | no disponible | no disponible | no disponible | Variante referenciada en la model card; sin datos adicionales |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Idiomas: solo soporta ingles y chino; no se garantiza calidad en otros idiomas.
- El parseo completo de documentos requiere el pipeline de dos etapas con PP-DocLayoutV3 y PaddlePaddle/PaddleX, lo que anade dependencias y complejidad de despliegue.
- El proyector visual es unicamente 4x; no existe variante 16x para este modelo.
- En cuantizacion Q4_K_M puede haber pequena degradacion en texto denso y perdida de barras de cierre en documentos con mucho codigo o XML; se recomienda Q8_0 para esos casos.
- Riesgo de alucinacion en regiones de baja calidad o con ruido visual; no se documentan tasas de error en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las dependencias del pipeline (PaddlePaddle/PaddleX y PP-DocLayoutV3) por si tuvieran condiciones distintas.
- El parseo documental en la app movil es solo para iOS por el momento.
- No se dispone de informacion sobre longitud de contexto maxima, lo que limita la planificacion para documentos de gran tamano sin trocear.

## Enlaces

- Hugging Face (este repositorio GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- Repositorio base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-OCR
- Guia del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- Agent Skill (SKILL.md): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md
- SDK en PyPI: https://pypi.org/project/minicpm-ocr/
- Demo CN: https://platform.modelbest.cn/console/playground/document-parse
- Demo Global: https://platform.modelbest.ai/console/playground/document-parse
- API docs CN: https://platform.modelbest.cn/console/docs/api/document-parse
- API docs Global: https://platform.modelbest.ai/console/docs/api/document-parse
- Demo iOS: https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo
- Discord: https://discord.gg/JE8KQqtdn
- llama.cpp: https://github.com/ggml-org/llama.cpp
