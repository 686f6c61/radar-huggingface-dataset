# kashishs25/adeguard-severity-biobert

## Resumen

El modelo kashishs25/adeguard-severity-biobert es un modelo de clasificación de texto basado en BERT, desarrollado por kashishs25 como parte del proyecto ADEGuard. Está especializado en la clasificación de la severidad de eventos adversos de medicamentos (ADEs) en textos clínicos. El modelo es un fine-tuning de BioBERT, como sugiere el tag arxiv:1910.09700. Con 108.312.579 parámetros, es un modelo de tamaño compacto que puede ejecutarse en hardware modesto. La relevancia del modelo radica en su aplicación en farmacovigilancia y análisis de seguridad de fármacos, donde la identificación automática de la gravedad de reacciones adversas es crítica. No se dispone de información pública detallada sobre los datos de entrenamiento, la licencia o los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only Transformer, basado en BioBERT) |
| Parametros totales | 108.312.579 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin informacion de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT (encoder-only Transformer), y el tag arxiv:1910.09700 indica que se basa en BioBERT, un modelo preentrenado en literatura biomedica. Es un modelo de clasificacion de texto, probablemente ajustado para clasificar la severidad de eventos adversos en narrativas clinicas. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card es una plantilla generada automaticamente y no incluye detalles sobre el procedimiento de entrenamiento.

## Capacidades

- Clasificacion de texto, especificamente clasificacion de severidad de eventos adversos de medicamentos (ADEs) en textos clinicos.
- Integrable en pipelines de procesamiento de lenguaje natural para farmacovigilancia, gracias a su naturaleza de clasificador de texto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio.
- No se especifican capacidades multilingues; el modelo probablemente opera sobre textos en ingles, pero no esta confirmado.

## Casos de uso

- Farmacovigilancia automatizada: el modelo puede clasificar la severidad de eventos adversos reportados en bases de datos como VAERS, ayudando a priorizar los casos mas graves para revision manual.
- Analisis de notas clinicas: integrado en sistemas de procesamiento de lenguaje natural, puede extraer y clasificar la severidad de reacciones adversas en historiales electronicos de salud.
- Soporte a decisiones clinicas: puede alertar a profesionales sanitarios sobre la gravedad de un evento adverso descrito en un informe clinico, facilitando una respuesta rapida.
- Investigacion farmacoepidemiologica: permite analizar grandes volumenes de textos para estudiar la seguridad de farmacos y detectar patrones de severidad.
- Monitorizacion de literatura medica: puede clasificar la severidad de eventos adversos en articulos cientificos, agilizando la revision sistematica de evidencias.
- Automatizacion de informes de seguridad: puede clasificar la severidad en informes de casos para agilizar la generacion de senales de seguridad en la industria farmaceutica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16, sin contar overhead. Se recomienda al menos 1-2 GB de VRAM para uso comodo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050, RTX 3060, A100). No requiere GPU de gama alta.
- Si cabe en GPU de consumo: si, es un modelo compacto que puede ejecutarse en GPUs de consumo.
- Opciones de despliegue: compatible con la libreria transformers, text-embeddings-inference y endpoints de HuggingFace. Tambien puede desplegarse en CPU o mediante ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- La model card es una plantilla generada automaticamente y no incluye informacion sobre sesgos, riesgos o limitaciones.
- La licencia no esta especificada, lo que puede restringir el uso comercial o la redistribucion del modelo.
- No se han publicado los datos de entrenamiento, lo que dificulta evaluar la generalizacion y la robustez del modelo.
- Al ser un modelo biomedico, requiere validacion en el dominio de uso antes de desplegarse en produccion.
- Existe riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios especializados como la farmacovigilancia.

## Enlaces

- HuggingFace: https://huggingface.co/kashishs25/adeguard-severity-biobert
- GitHub ADEGuard (PrameetKumar): https://github.com/PrameetKumar/ADEGuard
- GitHub ADEGuard (Sugiuma): https://github.com/Sugiuma/ADEGuard
