# AbteeXAILab/lumynax-ocr-trocr-large-handwritten

## Resumen

LumynaX OCR TrOCR Large Handwritten es un paquete de reconocimiento óptico de caracteres (OCR) para texto manuscrito, publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda) centrado en inteligencia artificial soberana y local-first. El paquete envuelve el modelo base `microsoft/trocr-large-handwritten` de Microsoft mediante el mecanismo de "infusión" de LumynaX Core, que orquesta la inferencia sin modificar los pesos originales. Se trata de un lanzamiento legacy (v0.1.0) marcado explícitamente como desactualizado y no recomendado para producción, conservado únicamente con fines de reproducibilidad e investigación.

El modelo combina un codificador visual (ViT) y un decodificador de texto (BERT) propios de la familia TrOCR, y está diseñado para transcribir imágenes de escritura manual a texto. Declara soporte para inglés y maorí (mi), y se distribuye bajo licencia MIT. Su relevancia actual es limitada: representa un experimento temprano de integración de modelos open source en el ecosistema LumynaX, pero no refleja las capacidades ni los estándares de seguridad de las versiones modernas de AbteeX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (TrOCR, basado en ViT + BERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, mi (ingles y maori) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 4.5 GB, formato no especificado) |

## Arquitectura y entrenamiento

El paquete no introduce una arquitectura nueva: reutiliza los pesos del modelo `microsoft/trocr-large-handwritten` sin modificacion alguna. La integracion se realiza mediante "routed infusion", donde LumynaX Core dirige la inferencia a traves del modelo seleccionado sin alterar sus pesos. No se documentan datos de entrenamiento adicionales, ni procesos de RLHF o DPO. El modelo base TrOCR fue entrenado por Microsoft con pares de imagenes de texto manuscrito y su transcripcion, pero esa informacion no se incluye en la model card de este release. Tampoco se especifican innovaciones tecnicas propias de AbteeX en esta version.

## Capacidades

- Reconocimiento de texto manuscrito a partir de imagenes (OCR de escritura a mano).
- Generacion de texto plano como salida de la transcripcion.
- Soporte multilingue declarado para ingles y maori, aunque no se detalla el alcance real.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta vision general ni otros dominios mas alla del OCR de manuscrito.
- El pipeline declarado es text-generation, pero el uso real es image-to-text.

## Casos de uso

- Digitalizacion de archivos historicos manuscritos: el modelo puede transcribir cartas, diarios o documentos antiguos escritos a mano, facilitando su busqueda y preservacion digital.
- Transcripcion de notas clinicas manuscritas: en entornos sanitarios donde las notas de pacientes aun se toman en papel, el OCR permite convertirlas a texto electronico para su integracion en historiales.
- Accesibilidad para personas con discapacidad visual: convertir documentos manuscritos a texto legible por lectores de pantalla.
- Procesamiento de formularios manuscritos: encuestas, evaluaciones o solicitudes cumplimentadas a mano pueden digitalizarse automaticamente.
- Archivado de correspondencia personal o corporativa: transcribir cartas y memorandos manuscritos para su indexacion y recuperacion.
- Investigacion en humanidades digitales: analisis de corpus manuscritos historicos o literarios mediante su conversion a texto plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base TrOCR large handwritten de Microsoft tiene metricas publicadas en su propia ficha, pero este paquete no las reproduce ni las actualiza.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 4.5 GB, lo que sugiere pesos en precision completa (fp32) o media (fp16), pero no se especifica.
- GPU recomendadas: no disponible. El modelo base TrOCR large puede ejecutarse en GPUs consumer de gama media (p. ej., RTX 3060 o superior) con suficiente VRAM, pero no hay datos oficiales para este paquete.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano del modelo base, pero no confirmado.
- Opciones de despliegue: compatible con la libreria transformers de Hugging Face; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumynaX OCR TrOCR Large Handwritten | TrOCR (ViT + BERT) | no disponible | no disponible | MIT | Hugging Face |
| microsoft/trocr-large-handwritten | TrOCR (ViT + BERT) | ~334M (referencia general) | 512 tokens (referencia general) | MIT | Hugging Face |
| microsoft/trocr-base-handwritten | TrOCR (ViT + BERT) | ~62M (referencia general) | 512 tokens (referencia general) | MIT | Hugging Face |

Nota: los datos de los modelos base de Microsoft son de conocimiento general y no estan verificados en la informacion proporcionada. Este paquete no anade diferencias funcionales respecto al modelo base, salvo el envoltorio de LumynaX.

## Limitaciones y advertencias

- Release legacy y desactualizado: la propia model card lo marca como "outdated" y no recomendado para produccion.
- No representa las capacidades actuales de AbteeX AI Labs ni de LumynaX Core.
- Limitado a OCR de texto manuscrito; no sirve para texto impreso ni otros dominios visuales.
- Idiomas declarados solo ingles y maori; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion en transcripciones ambiguas o de baja calidad de imagen.
- No se documentan sesgos especificos, pero el modelo base puede tener sesgos derivados de sus datos de entrenamiento (escritura latina principalmente).
- Licencia MIT permite uso comercial, pero al ser un paquete legacy, no hay soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/AbteeXAILab/lumynax-ocr-trocr-large-handwritten
- Repositorio GitHub: https://github.com/Aimaghsoodi/lumynax-ocr-trocr-large-handwritten
- Modelo base de Microsoft: https://huggingface.co/microsoft/trocr-large-handwritten
- AbteeX AI Labs: https://abteex.com
- LumynaX: https://lumynax.com
