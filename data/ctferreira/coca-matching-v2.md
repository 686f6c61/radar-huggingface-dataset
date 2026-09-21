# Ctferreira/coca-matching-v2

## Resumen
Ctferreira/coca-matching-v2 es un checkpoint de inicializacion publicado en HuggingFace por el usuario Ctferreira, asociado a una implementacion propia de arquitectura Coca orientada a tareas de matching. El repositorio contiene 49.600 parametros en un unico fichero safetensors, acompanado de `finetune.py`, `config.json` y `training_args.json`. La model card indica explicitamente que el checkpoint no ha sido entrenado ni auditado.

La relevancia es metodologica antes que de rendimiento: el autor no reclama ninguna puntuacion de benchmark y presenta la receta incluida (optimizador lion con schedule coseno) como valores de partida, no como evidencia de una ejecucion completada. Se trata de un punto de partida reproducible para entrenar y evaluar un modelo de matching, no de un modelo listo para produccion.

La arquitectura declarada es Coca a escala "large", con atencion de ventana deslizante, fusion bilineal, activacion approx gelu y normalizacion rmsnorm. No se publican datos sobre longitud de contexto, idiomas, composicion del dataset ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (transformer con atencion de ventana deslizante y fusion bilineal) |
| Parametros totales | 49.600 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica un checkpoint en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Escala declarada | large (segun la model card) |
| Mecanismo de atencion | Ventana deslizante (sliding window) |
| Fusion | Bilineal |
| Activacion | approx gelu |
| Normalizacion | rmsnorm |
| Optimizador por defecto | lion con schedule coseno |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 21 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento
La model card describe un modelo de arquitectura Coca con atencion de ventana deslizante, fusion bilineal entre representaciones, activacion approx gelu y normalizacion rmsnorm. La combinacion de fusion bilineal con una tarea declarada de matching sugiere un esquema de puntuacion de pares de entradas (por ejemplo, consulta-documento o par de textos), pero la documentacion no detalla el numero de capas, la dimension oculta, el numero de cabezas ni el tamano de la ventana de atencion. Tampoco hay informacion sobre si se trata de un encoder doble (dual encoder) o de un encoder cruzado.

En cuanto al entrenamiento, no hay ningun dato disponible: no se indica numero de tokens, composicion del dataset, idiomas, ni si hubo etapas de ajuste con RLHF, DPO o similares. El autor especifica que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo y que la configuracion de optimizador (lion) y schedule (coseno) son valores de partida del script, no evidencia de un entrenamiento completado. Llama la atencion la discrepancia entre la escala declarada ("large") y el recuento real de parametros (49.600), muy por debajo de lo que suele asociarse a esa etiqueta.

## Capacidades
- No hay capacidades verificadas. Al ser un checkpoint de inicializacion sin entrenamiento, el modelo no genera texto coherente ni produce puntuaciones de matching utiles.
- Generacion de texto, razonamiento, codigo y matematicas: no disponible; no se declaran ni se evaluan en el repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades multimodales (vision, audio) o modo "thinking": no disponible.
- Elementos arquitectonicos reutilizables si se entrena: atencion de ventana deslizante (coste de atencion lineal respecto al contexto dentro de la ventana), fusion bilineal para scoring de pares y normalizacion rmsnorm.
- Integracion: el autor advierte que, al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito.

## Casos de uso
- Pruebas de humo de carga de pesos: el fichero `model.safetensors` sirve para verificar que un pipeline de serializacion/deserializacion lee correctamente los tensores y el `config.json` antes de lanzar un entrenamiento real.
- Integracion continua en repositorios de entrenamiento: permite ejecutar `python finetune.py --help` y el bloque `__main__` en cada commit para detectar roturas en la logica de construccion del modelo sin coste de GPU.
- Pruebas de regresion de endpoints de inferencia: al ser un artefacto de 49.600 parametros, se puede desplegar en un servicio de pruebas para validar contratos de API, serializacion de respuestas y manejo de errores con latencia despreciable.
- Punto de partida para experimentos de matching: la configuracion de arquitectura (ventana deslizante, fusion bilineal, rmsnorm) puede reutilizarse como esqueleto y entrenarse sobre un conjunto de validacion emparejado, tal y como recomienda el propio autor.
- Docencia y estudio de arquitecturas: util para ilustrar el montaje de un transformer custom con atencion de ventana, activacion approx gelu y normalizacion rmsnorm sin necesidad de recursos de computo.
- Auditoria de procedencia y licencias: el repositorio es un caso sencillo para validar flujos internos de revision de licencias MIT y de trazabilidad de artefactos en un registro de modelos.
- Verificacion de herramientas de inspeccion de modelos: sirve como entrada minima para comprobar visores de safetensors, calculadoras de parametros y utilidades de conversion, que suelen fallar con configuraciones poco convencionales.
- Baseline metodologico de baja capacidad: en una comparativa experimental, puede actuar como referencia de capacidad minima para comprobar que una mejora observada no proviene de artefactos de evaluacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el repositorio omite deliberadamente cualquier afirmacion de benchmark y que el checkpoint no debe presentarse como un modelo entrenado y evaluado.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,19 MB en FP32 y 0,10 MB en FP16/BF16 (49.600 parametros). El peso del modelo es irrelevante frente a la sobrecarga del runtime de Python.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluida una GTX 1050 o una GPU integrada. Modelos como A100, H100 o RTX 4090 estan completamente sobredimensionados.
- Ejecucion en CPU: si, es el entorno natural para este artefacto.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: no hay soporte nativo conocido en vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje estandar ni existe una variante GGUF. Requiere un adaptador explicito sobre PyTorch, tal y como advierte la model card.
- Latencia y throughput: no disponibles. Cualquier cifra medible estaria dominada por el arranque del interprete y la carga del fichero, no por el calculo.

## Comparativa con modelos similares
No disponible. No se han identificado modelos comparables en la informacion proporcionada y la comparacion carece de sentido tecnico en este caso: se trata de un checkpoint de inicializacion sin entrenar de 49.600 parametros, no de un modelo funcional de matching. Compararlo con sistemas de recuperacion o de puntuacion de pares entrenados (del tipo bi-encoder o cross-encoder) no aportaria informacion util, porque no existe una metrica de tarea que ambos puedan ejecutar en igualdad de condiciones. La busqueda web realizada no devolvio ninguna referencia tecnica relacionada con este modelo.

## Limitaciones y advertencias
- El checkpoint no ha sido entrenado. Los pesos son una inicializacion; cualquier salida carece de valor semantico.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun declara el propio autor.
- Sesgos conocidos: no disponibles; no puede evaluarse el sesgo de un modelo sin entrenamiento ni datos documentados.
- Riesgo de alucinacion: no aplica a un checkpoint sin entrenar, pero cualquier uso que asuma capacidad generativa produciria resultados sin sentido.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto efectiva ni cobertura idiomatica.
- Discrepancia de nomenclatura: la escala declarada ("large") no concuerda con los 49.600 parametros reales, lo que puede inducir a error si se usa como referencia de tamano.
- Integracion: las APIs genericas de carga automatica de HuggingFace no funcionaran sin un adaptador explicito.
- Licencia: MIT, permisiva para uso comercial, pero el autor recomienda revisar por separado los terminos de los datos de origen si se combina con datasets externos.
- Reproducibilidad: no hay resultados publicados, semillas ni registros de entrenamiento; cualquier resultado futuro deberia documentarse por separado de los valores por defecto incluidos.
- Advertencia de evaluacion: comparar este modelo con alternativas exige igualar exposicion de datos, presupuesto de ajuste y semillas aleatorias, tal y como senala el autor.

## Enlaces
- HuggingFace: https://huggingface.co/Ctferreira/coca-matching-v2
- Fitxers del repositori: `finetune.py` (artefacto principal, con bloque `__main__` y ejemplo de prueba de humo), `config.json` (configuracion de arquitectura), `training_args.json` (receta de experimento por defecto), `model.safetensors` (checkpoint de inicializacion).
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los unicos resultados devueltos fueron paginas de inicio de sesion del servicio de correo STRATO Webmail, sin ninguna relacion con el modelo.
