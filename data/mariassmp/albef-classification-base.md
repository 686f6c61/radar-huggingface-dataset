# mariassmp/albef-classification-base

## Resumen

Este repositorio publica una implementación personalizada del modelo Albef (Align before Fuse) para tareas de clasificación, desarrollada por el autor `mariassmp`. La configuración declarada es de escala `large`, con atención de ventana deslizante, fusión tensorial, activación GELU y normalización GroupNorm. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, no un modelo entrenado: el autor indica explícitamente que no se reclama ninguna puntuación de benchmark. El objetivo es ofrecer código transparente y experimentos reproducibles, con un script `eval.py` que contiene el modelo y un ejemplo ejecutable o de entrenamiento.

El tamaño real del checkpoint es de 24.832 parámetros según safetensors, con un repositorio de 0.0 GB y cero descargas. La licencia es Apache 2.0. No se especifican idiomas, longitud de contexto ni tipos de cuantización. Al carecer de entrenamiento, este modelo no está listo para producción, pero puede servir como esqueleto de referencia para investigar arquitecturas Albef o como base para adaptadores personalizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Albef (clasificación) |
| Parametros totales | 24.832 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el enfoque Albef para predicción de clasificación, con una configuración declarada como `large`. Incluye atención de ventana deslizante (sliding window attention), fusión tensorial (tensor fusion), activación GELU y normalización GroupNorm. El repositorio incorpora `config.json` con los ajustes generados de arquitectura y `training_args.json` con una receta experimental por defecto que usa SGD y un programador exponencial; estos valores son iniciales del script y no evidencian un entrenamiento completado.

No se han proporcionado datos de entrenamiento ni composición de dataset. El propio autor señala que `model.safetensors` es un checkpoint de inicialización para pruebas de humo y no un checkpoint entrenado. Tampoco se menciona RLHF ni DPO. La implementación es personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.

## Capacidades

- Sin capacidades funcionales documentadas: el checkpoint no ha sido entrenado ni evaluado, por lo que no se pueden afirmar resultados de generación, razonamiento, codigo, matematicas, vision ni tool calling.
- El repositorio permite pruebas de arranque (smoke tests) de la implementacion, no inferencia util en produccion.
- No soporta agentes ni razonamiento multi-paso.
- El modo multilingue no esta disponible en la informacion proporcionada.
- No se ha verificado compatibilidad con frameworks de despliegue estandar.

## Casos de uso

- Pruebas de humo en pipelines de clasificacion: el script `eval.py` permite verificar que la implementacion carga y ejecuta con configuraciones arbitrarias antes de invertir en entrenamiento.
- Desarrollo de adaptadores para APIs de carga automatica del ecosistema HuggingFace: al ser una implementacion personalizada, se puede usar como caso de prueba para escribir adaptadores no estandar.
- Investigacion de arquitecturas Albef: el codigo y `config.json` sirven como referencia para modificar componentes como la atencion o la fusion y estudiar su comportamento.
- Punto de partida para entrenamiento con datos propios: el checkpoint ofrece una inicializacion valida para experimentos de entrenamiento a pequeña escala o validaciones de pipeline.
- Generacion de baselines de capacidad equivalente: en estudios comparativos se puede entrenar este modelo con un presupuesto reducido y comparar contra otros modelos de la misma categoria.
- Docencia y formacion en vision por computador: la estructura del codigo y los archivos de configuracion son utiles para explicar como se organiza un modelo de clasificacion Albef.
- Pruebas de integracion con cargadores personalizados de safetensors: sirve para validar que una herramienta propia gestiona correctamente este formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño del checkpoint (24.832 parametros), el coste de memoria es minimo, pero no hay datos publicados.
- GPU recomendadas: no documentadas. Con este tamaño, cualquier GPU moderna o incluso una CPU permitiria ejecutar el script, aunque no se ha verificado.
- Cabe en GPU de consumo: si, por el reducido numero de parametros, aunque no existen pruebas oficiales.
- Opciones de despliegue: no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI. El checkpoint esta en formato safetensors y podria probarse con cargadores personalizados, pero no se recomienda para inferencia real.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este checkpoint no tiene metricas publicadas y no puede compararse con modelos entrenados. La implementacion es un punto de partida experimental sin benchmarks.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad, sesgos o transferencia de dominio.
- No es apto para uso en produccion: carece de capacidades funcionales confirmadas.
- No se han documentado riesgos de alucinacion ni sesgos especificos porque no hay evaluaciones.
- La carga automatica mediante APIs genericas requiere un adaptador explicito.
- La licencia Apache 2.0 permite uso comercial del codigo, pero el estado sin entrenar invalida cualquier uso comercial directo como modelo de inferencia.
- No hay informacion sobre idiomas, contexto ni cuantizaciones, lo que limita su aplicabilidad en entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/mariassmp/albef-classification-base
- Repositorio de codigo Albef classification: https://github.com/OpenEnvision/WorldFoundry/blob/main/worldfoundry/base_models/perception_core/video_text/vqa_score/models/vqascore_models/lavis/models/albef_models/albef_classification.py
- Repositorio con una implementacion similar: https://huggingface.co/ARTHURDRODRIGUES/albef-classification
