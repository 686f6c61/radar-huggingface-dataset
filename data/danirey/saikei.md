# DaniRey/saikei

## Resumen

Saikei es un asistente documental local desarrollado por DaniRey que funciona íntegramente en el equipo del usuario, sin enviar datos a internet. Combina varios modelos open source (Qwen3.6-35B-A3B como modelo principal, Qwen3.8-27B como modelo opcional de razonamiento avanzado, Qwen3-Embedding-0.6B para búsqueda semántica y PaddleOCR-VL-1.5 para OCR) en un paquete instalable para Mac (Apple Silicon) y Windows, orientado a leer, resumir y cuadrar documentos: PDF (también escaneados), Word, Excel, PowerPoint, correos y fotos de papeles. Su caso de uso estrella es el trabajo con facturas: sumarlas, cuadrar el IVA del trimestre contra los modelos 303 y 130 y preparar borradores antes de presentarlos.

No se trata de un modelo suelto, sino de una distribución completa: el repositorio contiene instaladores, un llama-server modificado con formatos de cuantización propios (ZT2, ZT3) y los pesos en GGUF. El modelo principal, Qwen3.6-35B-A3B, es un MoE de 34,66 mil millones de parámetros totales cuantizado a 2-3 bits en formatos por trellis, que cabe en un Mac de 16 GB gracias a la lectura de expertos desde disco. Es relevante porque demuestra que un pipeline documental completo con OCR, embeddings y razonamiento puede ejecutarse en hardware de consumo, con privacidad total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.6-35B-A3B) + modelo denso opcional (Qwen3.8-27B) + OCR (PaddleOCR-VL-1.5) + embeddings (Qwen3-Embedding-0.6B) |
| Parametros totales | 34.660.610.688 (modelo principal, dato safetensors) |
| Parametros activos | no disponible (aprox. 3B por la nomenclatura A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ZT2 (2 bits), ZT3 (3 bits), ZT3Vh16 (propios de Saikei), Q8_0, F16 (mmproj) |
| Idiomas soportados | es (según model card) |
| Licencia | apache-2.0 (modelos); el programa Saikei es propietario, todos los derechos reservados |
| Formato de pesos | GGUF (formatos ZT2/ZT3 solo legibles por el llama-server de Saikei) |

## Arquitectura y entrenamiento

El modelo principal es Qwen3.6-35B-A3B, un mixture-of-experts de 34,66 mil millones de parámetros cuantizado por Saikei en el formato ZT2M: los expertos (gate/up) van a 2 bits en las capas 0 a 34 y a 3 bits (ZT3) en las capas 35 a 39, ocupando 12,07 GB con una perplejidad un 0,9 % peor que la cuantización completa ZT3. Incluye un proyector de visión en F16 (0,9 GB) para leer imágenes y páginas, y una capa MTP (multi-token prediction) separada que propone borradores que el modelo verifica, logrando un 25 % más de velocidad de generación en CPU con la misma salida.

El modelo opcional "Saikei Listo" usa Qwen3.8-27B, un modelo denso cuantizado en ZT3Vh16 (3 bits por pares, con 2 bits en las FFN de las capas 0 a 19; KLD de 0,070 frente al Q8_0), con su capa MTP integrada en el mismo archivo. El pipeline se completa con Qwen3-Embedding-0.6B (Q8_0) para búsqueda semántica y PaddleOCR-VL-1.5/1.6 para OCR de escaneados y fotos. No hay datos públicos sobre entrenamiento adicional (fine-tuning, RLHF, DPO): Saikei es una recuantización y empaquetado de modelos base de Qwen y PaddlePaddle, no un modelo entrenado desde cero.

## Capacidades

- Lectura y resumen de documentos: PDF (nativos y escaneados), Word, Excel, PowerPoint, correos y fotografías de papel.
- OCR de documentos escaneados mediante PaddleOCR-VL-1.5 (pipeline image-text-to-text).
- Búsqueda semántica en el corpus documental mediante embeddings (Qwen3-Embedding-0.6B).
- Cálculo y cuadre de facturas: sumatorios, verificación del IVA trimestral contra los modelos fiscales 303 y 130.
- Generación de borradores trimestrales de impuestos como apoyo previo a la presentación.
- Visión integrada: interpretación de imágenes y páginas vía mmproj F16.
- Razonamiento mejorado con el modo opcional "Saikei Listo" (Qwen3.8-27B), a costa de la mitad de velocidad.
- Decodificación especulativa mediante capa MTP para acelerar la generación.
- Funcionamiento 100 % local: documentos, índice y consultas no salen del equipo.
- Instalación sin búsqueda en internet.

## Casos de uso

- Cuadre trimestral del IVA para autónomos y pymes: el usuario apunta su carpeta de facturas y el modelo las suma y verifica el IVA del trimestre contra el modelo 303 o 130, generando un borrador revisable antes de presentarlo.
- Digitalización de archivo de papel: con el OCR de PaddleOCR-VL, fotografías y escaneados de facturas o albaranes se convierten en texto indexado y consultable.
- Asistente de documentación empresarial: búsqueda semántica sobre contratos, correos y presentaciones sin subir nada a la nube, adecuado para despachos con datos sensibles.
- Resumen de informes largos: con el modo "Saikei Listo", razona sobre documentos de 3.000 a 10.000 tokens a unos 16 tok/s en un M1 Pro.
- Verificación contable de correos: extrae datos de correos electrónicos (importes, fechas, proveedores) y los cruza con las facturas del trimestre.
- Trabajo offline en portátiles modestos: gracias a la lectura de expertos desde disco, funciona desde 8 GB de RAM, útil para equipos antiguos o sin GPU.
- Preparación de declaraciones fiscales: genera borradores de los modelos 303 y 130 a partir de la documentación local, siempre como ayuda previa a revisión profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados son:

| Métrica | Valor |
|---|---|
| Perplejidad de ZT2M frente a ZT3 | un 0,9 % peor |
| KLD de ZT3Vh16 (Qwen3.8-27B) frente a Q8_0 | 0,070 |
| Velocidad Qwen3.6-35B-A3B en Mac | ~31 tok/s (implícito, M1 Pro) |
| Velocidad Qwen3.8-27B en M1 Pro | ~16 tok/s (documentos de 3.000-10.000 tokens) |
| Ganancia de velocidad con MTP en CPU Windows | +25 % (~16 tok/s en PC de sobremesa) |

## Requisitos de hardware

- Mac Apple Silicon con macOS 14 o posterior: funciona desde 8 GB de memoria unificada (el instalador ajusta cuánto del modelo se mantiene en RAM); recomendado 16 GB o más.
- Windows 10/11 de 64 bits: 16 GB de RAM como mínimo (justo, sin visión), 32 GB recomendado; funciona en CPU con AVX2, sin tarjeta gráfica.
- Espacio en disco: ~15 GB en Mac (13 GB con `--no-vision --no-ocr`), ~17 GB en Windows; 10 GB adicionales con "Saikei Listo".
- "Saikei Listo" (Qwen3.8-27B denso, ~10 GB en memoria): requiere Mac de 16 GB o más.
- No cabe en VRAM de GPU consumer en el sentido tradicional: el diseño está pensado para CPU/Apple Silicon con memoria unificada; los formatos ZT2/ZT3 no son compatibles con llama.cpp oficial, vLLM, Ollama, LM Studio ni TGI.
- Despliegue: exclusivamente mediante los instaladores oficiales (`install.sh` en Mac, `install.ps1` en Windows) con el llama-server de Saikei; los botones "Use this model" de Hugging Face no funcionan con estos pesos.
- Descarga verificada por SHA-256 con reanudación de descargas interrumpidas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Saikei (Qwen3.6-35B-A3B ZT2M) | 34,66B (MoE) | GGUF ZT2/ZT3 propio | no disponible | apache-2.0 (modelos), programa propietario | Pipeline completo con OCR, embeddings y asistente fiscal local |
| Qwen3.6-35B-A3B (base, Qwen) | 34,66B (MoE) | safetensors / GGUF estándar | no disponible | apache-20 (según HF) | Modelo base sin cuantización Saikei ni tooling documental |
| Qwen3.8-27B (base, Qwen) | 27B (denso) | safetensors / GGUF estándar | no disponible | no disponible | Incluido en Saikei como modo de razonamiento mejorado |
| PaddleOCR-VL-1.5 (PaddlePaddle) | no disponible | safetensors | no disponible | no disponible | Especializado en OCR de documentos; componente de Saikei |

La comparación directa es difícil: Saikei no compite como LLM genérico, sino como producto vertical de gestión documental local. Frente a alternativas tipo "asistente documental RAG local" (por ejemplo, combinaciones de Ollama + LlamaIndex + un OCR), Saikei ofrece un empaquetado llave en mano con cuantizaciones agresivas que permiten ejecutar un MoE de 35B en 8-16 GB de RAM.

## Limitaciones y advertencias

- Los formatos ZT2, ZT3 y ZT3Vh16 no son estándar: los pesos solo funcionan con el llama-server de Saikei, lo que impide usarlos en llama.cpp oficial, vLLM, Ollama, LM Studio, TGI o cualquier stack convencional.
- El programa (instaladores, llama-server de Saikei, lectores y scripts) es software propietario: se puede usar gratis pero no redistribuirlo, venderlo, modificarlo ni descompilarlo. Solo los modelos subyacentes están bajo apache-2.0.
- Se ofrece "tal cual, sin garantías": los cuadres y borradores de impuestos son una ayuda y deben revisarse antes de presentar nada a Hacienda; el propio autor lo advierte.
- La cuantización a 2 bits en la mayoría de capas (ZT2M) implica una pérdida medible (perplejidad un 0,9 % peor que ZT3); en tareas delicadas de cálculo fiscal conviene verificar los resultados.
- En Windows con 16 GB de RAM el funcionamiento es "justo" sin visión; con 8 GB solo en Mac y con limitaciones.
- El modo "Saikei Listo" va a la mitad de velocidad (~16 tok/s frente a ~31 tok/s) y exige 16 GB de memoria.
- No hay datos publicados de benchmarks estándar, contexto máximo, sesgos ni tasa de alucinación; el riesgo de alucinación propio de los LLM aplica, especialmente en sumas y cálculos de IVA.
- Idioma declarado: español; no hay información sobre rendimiento en otros idiomas.
- El model card aparece truncado en la sección de licencias, por lo que pueden existir términos adicionales no visibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DaniRey/saikei
- Modelos base referenciados:
  - Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
  - Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
  - Qwen/Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
  - PaddlePaddle/PaddleOCR-VL-1.5: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5
- Instalador Mac: https://huggingface.co/DaniRey/saikei/resolve/main/install.sh
- Instalador Windows: https://huggingface.co/DaniRey/saikei/resolve/main/install.ps1
