# Kjankowski/multitask-scratch-2023

## Resumen

`Kjankowski/multitask-scratch-2023` es un repositorio experimental publicado en HuggingFace por el usuario Kjankowski que contiene una implementación propia de una arquitectura tipo Mixer (MLP-Mixer) orientada a tareas multitarea. No se trata de un modelo entrenado ni evaluado: la propia model card lo describe como un banco de pruebas arquitectónico y el fichero `model.safetensors` se presenta explícitamente como un checkpoint de inicialización para "smoke tests", no como un modelo con pesos aprendidos. El recuento real de parámetros del checkpoint es de 49.600, una cifra muy alejada de lo que sugiere la etiqueta de escala "huge" que figura en la configuración.

El interés del repositorio es, por tanto, de naturaleza metodológica. Incluye `train.py` como artefacto principal, `config.json` con los ajustes de arquitectura y `training_args.json` con la receta de experimento por defecto (optimizador AdamW con scheduler polinómico). Está pensado para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, con una recomendación explícita del autor de comparar contra una línea base de capacidad equivalente y de reportar métricas sobre al menos tres semillas.

Su relevancia actual es limitada dentro del ecosistema: registra 0 descargas y 0 me gusta, no declara idiomas, no declara pipeline y no publica ningún resultado de benchmark. Resulta útil únicamente como punto de partida reproducible para investigación en arquitecturas alternativas al transformer con atención, o como plantilla de código para montar experimentos multitarea controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (familia MLP-Mixer), con atencion flash declarada en la configuracion |
| Parametros totales | 49.600 (dato real leido de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |
| Escala declarada por el autor | "huge" (contradice el recuento real de parametros) |
| Fusion | concat mlp |
| Activacion | swish |
| Normalizacion | batchnorm |
| Optimizador por defecto | AdamW |
| Scheduler por defecto | polinomial |
| Tamano del repositorio | 0,0 GB |
| Descargas / me gusta | 0 / 0 |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura declarada es un Mixer, es decir, un diseño de mezcla de canales y tokens basado en perceptrones multicapa en lugar de autoatención, con fusión de tipo "concat mlp", activación swish y normalización por lotes (batchnorm). La configuración menciona además atención flash, lo que resulta llamativo en un Mixer puro y sugiere una implementación híbrida o un campo heredado de una plantilla; la model card no aclara esta discrepancia. El parámetro de escala figura como "huge", pero el checkpoint real contiene 49.600 parámetros, un orden de magnitud propio de un modelo de juguete, por lo que la etiqueta debe interpretarse como un valor de configuración del script y no como una descripción del artefacto publicado.

En cuanto al entrenamiento, no hay ninguno documentado. La receta por defecto usa AdamW con un scheduler polinómico, pero el propio autor aclara que son valores de arranque del script y no evidencia de una ejecución completada. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas adicionales más allá de la elección de normalización y activación. La model card indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarla.

## Capacidades

- No se puede afirmar ninguna capacidad funcional: el checkpoint publicado es de inicialización y no ha sido entrenado.
- Generacion de texto: no disponible, no hay evidencia de entrenamiento ni tokenizador documentado.
- Razonamiento, codigo o matematicas: no disponible.
- Tool calling / function calling: no soportado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara ningun idioma.
- Vision, audio o modo "thinking": no disponibles.
- Capacidad real del repositorio: servir como base de codigo ejecutable para experimentos de arquitectura multitarea y como punto de partida para smoke tests.

## Casos de uso

- Investigacion en arquitecturas sin atencion: el repositorio permite modificar la mezcla de tokens y canales en `train.py` y verificar que el grafo se construye correctamente antes de escalar a un entrenamiento real, sin coste de GPU apreciable.
- Smoke test de pipelines de entrenamiento: con 49.600 parametros, el forward y el backward se ejecutan en segundos en CPU, lo que sirve para validar logging, checkpoints, reanudacion y versionado de entornos antes de lanzar un job grande.
- Ablacion de normalizacion: la configuracion fija batchnorm, de modo que el repositorio es un punto de partida directo para comparar batchnorm frente a layernorm o RMSNorm manteniendo el resto de hiperparametros constante.
- Estudio de recetas de optimizacion: la combinacion AdamW con scheduler polinomico permite reproducir experimentos de sensibilidad al decaimiento de learning rate en modelos multitarea de capacidad reducida.
- Material docente: sirve para explicar de forma tangible la diferencia entre un Mixer y un transformer, ya que el modelo es lo bastante pequeno para inspeccionar tensores intermedios a mano.
- Plantilla de evaluacion reproducible: la propia model card propone un protocolo con conjunto de validacion especifico de tarea, tres semillas y linea base de capacidad equivalente, replicable sobre este codigo.
- Base para adaptadores de carga: dado que requiere adaptador explicito, es un caso practico para desarrollar integraciones con frameworks de inferencia que no reconocen arquitecturas personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada: derivada aritmeticamente del recuento de parametros, en fp32 el checkpoint ocupa aproximadamente 0,19 MB y en fp16 aproximadamente 0,10 MB. Estas cifras son calculos a partir de los 49.600 parametros, no datos publicados por el autor.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU con al menos unos pocos megabytes libres, incluidas integradas.
- GPU de consumo: si, cabe con margen enorme en cualquier RTX, GTX o incluso en CPU. Un unico nucleo es suficiente para inferencia.
- Opciones de despliegue: no hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI. La model card advierte que las APIs genericas de carga automatica necesitan un adaptador explicito por tratarse de una implementacion propia. El punto de entrada documentado es `python train.py --help`.
- Latencia y throughput: no disponibles; en cualquier caso estarian dominados por el overhead del framework y no por el coste computacional del modelo.
- Espacio en disco: el repositorio completo ocupa 0,0 GB segun HuggingFace.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables de la misma categoria, y no es posible establecer comparaciones numericas fiables con alternativas porque el repositorio no publica parametros de referencia, contexto, metricas ni recetas completas. Como referencia conceptual, la arquitectura Mixer se remonta al trabajo MLP-Mixer, pero no se dispone de datos de este repositorio frente a dicha referencia.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Kjankowski/multitask-scratch-2023 | 49.600 | no disponible | BSD-3-Clause | checkpoint de inicializacion, sin entrenar |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier salida que produzca carece de valor semantico.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal como reconoce el propio autor.
- Ausencia total de datos de benchmarks, lo que impide cualquier afirmacion de rendimiento.
- Discrepancia entre la escala declarada ("huge") y los 49.600 parametros reales; conviene tratar la etiqueta de configuracion con escepticismo.
- No se declaran idiomas soportados, por lo que no se puede asumir cobertura multilingue ni siquiera monolingue.
- No se documenta longitud de contexto ni tokenizador.
- Riesgo de alucinacion: no aplica en el sentido habitual porque el modelo no genera lenguaje de forma entrenada, pero si existe riesgo de interpretar erroneamente el repositorio como un modelo listo para produccion.
- Licencia BSD-3-Clause: permite uso comercial y modificacion, con la obligacion de conservar el aviso de copyright y la clausula de exencion de responsabilidad, y sin poder usar el nombre del autor para respaldar trabajos derivados sin permiso.
- La model card advierte de revisar por separado los terminos de los datos de origen si se combina el repositorio con datasets externos.
- Sin validacion de la comunidad: 0 descargas y 0 me gusta implican que el codigo no ha sido probado por terceros.
- No se declara pipeline de HuggingFace, por lo que no funciona con `pipeline()` sin trabajo adicional.
- Las fechas de creacion y actualizacion registradas (2026-10-09) no son verificables de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kjankowski/multitask-scratch-2023

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la informacion disponible.
