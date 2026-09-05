# keithtwesigye/lunyoro-nllb-en2lun

## Resumen

El modelo `keithtwesigye/lunyoro-nllb_en2lun` es un modelo de traduccion automatica neuronal de ingles a lunyoro/rutooro, desarrollado por el usuario `keithtwesigye`. Se basa en el modelo `facebook/nllb-200-distilled-600M` de Meta, y ha sido ajustado con aproximadamente 53.948 pares de frases ingles-lunyoro. El modelo resuelve el problema de la escasez de recursos de traduccion para la lengua lunyoro-rutooro, hablada en el oeste de Uganda por los reinos Bunyoro-Kitara y Tooro. Su relevancia radica en ofrecer una herramienta open source para la preservacion y accesibilidad de una lengua minoritaria, con licencia MIT y pesos en formato safetensors.

Con 615.073.792 parametros, es un modelo denso (no MoE) y su arquitectura es un transformer encoder-decoder. No se proporciona informacion sobre la longitud de contexto especifica de este ajuste. El modelo se puede cargar con Hugging Face Transformers y genera traducciones usando el tokenizador NLLB con `forced_bos_token_id` para el idioma destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) basado en NLLB-200 destilado |
| Parametros totales | 615.073.792 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (eng_Latn) y lunyoro/rutooro (run_Latn) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder entrenado por Meta para traduccion multilingue. El ajuste fino se realizo durante 10 epocas con el optimizador AdamW y una programacion de tasa de aprendizaje coseno. El conjunto de datos de entrenamiento consta de aproximadamente 53.948 pares de frases ingles-lunyoro, compilados a partir de aportaciones de hablantes, entradas de diccionario Runyoro-Rutooro, corpus paralelos y aumentacion mediante back-translation. El entrenamiento se llevo a cabo en hardware GPU NVIDIA con CUDA. No se detallan innovaciones tecnicas adicionales mas alla del ajuste fino.

## Capacidades

- Traduccion automatica de ingles a lunyoro/rutooro, con control del idioma de salida mediante `forced_bos_token_id`.
- Generacion de texto en secuencias (seq2seq) para tareas de traduccion.
- Soporte de tokenizacion especifica de NLLB-200 con codigos de idioma (`eng_Latn`, `run_Latn`).
- No se han documentado capacidades de tool calling, agentes, vision o audio en la informacion disponible.
- El modelo puede integrarse en pipelines de traduccion con Hugging Face Transformers.

## Casos de uso

- Traduccion de documentos PDF/DOCX: el modelo puede integrarse en aplicaciones que procesen documentos y extraigan texto para traducirlo al lunyoro, como se plantea en el proyecto TRANSLATOR.
- Asistente de traduccion para hablantes de lunyoro: combinado con un diccionario y un knowledge graph, puede ofrecer traducciones contextualizadas y correccion gramatical.
- Accesibilidad de contenido digital: traducir webs, aplicaciones o material educativo al lunyoro para fomentar el uso de la lengua en comunidades ugandesas.
- Aumentacion de datos para otros modelos: usar back-translation con este modelo para generar pares lunyoro-ingles y mejorar otros sistemas de traduccion.
- Traduccion en dominios especificos: el proyecto TRANSLATOR menciona dominios como medicina, educacion y agricultura; el modelo puede ser afinado o combinado con recuperacion selectiva (RAG) para estos ambitos.
- Traduccion de voz: en combinacion con reconocimiento y sintesis de voz, el modelo puede usarse en aplicaciones de traduccion hablada para turismo o servicios publicos en Uganda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 615M parametros en FP32, los pesos ocupan aproximadamente 2,5 GB; añadiendo activaciones, se recomienda una GPU con al menos 4 GB de VRAM para inferencia. En FP16 la VRAM se reduce a la mitad.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4090, A100 o H100 para despliegues de mayor escala.
- Si cabe en GPUs de consumo: con 8 GB de VRAM se puede ejecutar en FP16 sin problemas.
- Opciones de despliegue: Hugging Face Transformers (inferencia directa), vLLM y TGI para servidores de inferencia; llama.cpp y Ollama no estan confirmados para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Direccion | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lunyoro-nllb_en2lun` | Ingles → Lunyoro | 615.073.792 | MIT | HuggingFace |
| `lunyoro-nllb_lun2en` | Lunyoro → Ingles | No disponible | MIT | HuggingFace |
| `lunyoro-en2lun` (MarianMT) | Ingles → Lunyoro | No disponible | No disponible | HuggingFace |
| `facebook/nllb-200-distilled-600M` | Multilingue | 600M (aprox.) | No disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos; al entrenarse con un corpus pequeno (53.948 pares), el modelo puede reflejar sesgos presentes en las aportaciones de los hablantes.
- Riesgo de alucinacion: en traducciones de frases complejas o fuera de dominio, el modelo puede producir traducciones inexactas o inventar terminos.
- Limitaciones de idioma: solo soporta ingles y lunyoro/rutooro; no maneja otros idiomas ni variantes dialectales con solvencia.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo ajustado puede estar sujeto a la licencia del modelo base (NLLB-200), que no se especifica en la informacion disponible.
- Caveat: el modelo fue entrenado con un conjunto de datos limitado y puede no generalizar bien a textos tecnicos o literarios.

## Enlaces

- HuggingFace: https://huggingface.co/keithtwesigye/lunyoro-nllb_en2lun
- Modelo hermano (lunyoro-nllb_lun2en): https://huggingface.co/keithtwesigye/lunyoro-nllb_lun2en
- Proyecto TRANSLATOR (GitHub): https://github.com/K227-arch/TRANSLATOR
- Modelo base NLLB-200 destilado: https://huggingface.co/facebook/nllb-200-distilled-600M
