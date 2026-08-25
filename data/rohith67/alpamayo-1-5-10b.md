# Rohith67/Alpamayo-1.5-10B

## Resumen

Alpamayo 1.5 es un modelo de visión-lenguaje-acción (VLA) de 10.000 millones de parámetros desarrollado por NVIDIA para conducción autónoma. Está construido sobre el modelo de lenguaje visual Cosmos-Reason2-8B, al que se añade un decodificador de trayectorias basado en difusión de 2.300 millones de parámetros. El modelo ha sido post-entrenado con aprendizaje por refuerzo (RL) y está diseñado para generar razonamiento encadenado de causalidad (Chain-of-Causation) junto con predicciones de trayectoria del vehículo.

La relevancia de este modelo radica en que aborda uno de los problemas más difíciles de la conducción autónoma: el manejo de eventos raros y de cola larga. Al combinar razonamiento textual explícito con predicción de trayectorias, permite a investigadores y desarrolladores del sector evaluar y construir sistemas de conducción más interpretables y robustos. El modelo soporta entrada multi-cámara, guía de navegación y respuestas a preguntas del usuario, lo que lo convierte en una herramienta interactiva para el desarrollo de sistemas de conducción autónoma.

La versión publicada en HuggingFace (Rohith67/Alpamayo-1.5-10B) es un espejo de la versión oficial de NVIDIA (nvidia/Alpamayo-1.5-10B), con la misma arquitectura y pesos. El modelo se distribuye bajo licencia OpenMDW-1.1, que permite uso no comercial, con licencias comerciales disponibles bajo petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (VLA basado en Cosmos-Reason2 con decodificador de trayectoria por difusion) |
| Parametros totales | 11.078.526.194 (backbone: 8.2B, action expert: 2.3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | OpenMDW-1.1 (uso no comercial; licencia comercial bajo peticion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Alpamayo 1.5 es un modelo de arquitectura Transformer que combina un backbone de vision-lenguaje (Cosmos-Reason2, 8.2B parametros) con un decodificador de acciones basado en difusion (2.3B parametros). El backbone procesa imagenes multi-camara, texto y historial de egomocion, mientras que el decodificador genera trayectorias futuras representadas como secuencias de acciones dinamicas (aceleracion y curvatura) en un modelo unicycle en espacio BEV (bird's-eye-view). El modelo fue post-entrenado con aprendizaje por refuerzo para mejorar sus capacidades de razonamiento y seguimiento de instrucciones.

Los datos de entrenamiento incluyen mas de 1.000 millones de imagenes procedentes de 80.000 horas de conduccion multi-camara, menos de mil millones de tokens de texto (3 millones de trazas de Chain-of-Causation, datos de Cosmos-Reason y datasets publicos) y 80.000 horas de datos de trayectoria muestreados a 10 Hz. El conjunto de datos combina informacion propietaria de NVIDIA, datasets publicos de conduccion y datos sinteticos generados por VLM. El modelo acepta 4 camaras por defecto (frontal-angular, frontal-tele, lateral-izquierdo, lateral-derecho) con una ventana de historial de 0,4 segundos a 10 Hz (4 fotogramas por camara), y genera trayectorias de 6,4 segundos (64 waypoints a 10 Hz) con posicion (x, y, z) y matriz de rotacion en el sistema de coordenadas del vehiculo.

## Capacidades

- Razonamiento encadenado de causalidad (Chain-of-Causation): genera trazas textuales que explican las decisiones de conduccion y los factores causales implicados.
- Prediccion de trayectorias: genera 64 waypoints futuros (6,4 segundos) con posicion y orientacion en el sistema de coordenadas del vehiculo.
- Guia de navegacion: acepta instrucciones de navegacion como entrada textual para condicionar la generacion de trayectorias.
- Respuesta a preguntas del usuario: puede responder preguntas sobre la escena de conduccion (visual question answering).
- Soporte multi-camara: configuracion flexible de camaras (4 por defecto, ampliable) con resolucion de entrada de 1080x1920 píxeles (reducida a 320x576 por el procesador).
- Entrada de egomocion: acepta historial de movimiento del vehiculo (16 waypoints a 10 Hz) con traslacion 3D y rotacion 3x3.
- Integracion con software de conduccion autonoma: puede integrarse en pipelines de percepcion, razonamiento y planificacion de movimiento.

## Casos de uso

- Evaluacion de eventos de cola larga en conduccion autonoma: el modelo puede simular y razonar sobre escenarios raros (obras, accidentes, comportamientos impredecibles de peatones) gracias a su capacidad de generar trazas de causalidad junto con trayectorias, lo que permite a los equipos de I+D analizar como responderia un sistema ante situaciones poco frecuentes.
- Desarrollo de sistemas de conduccion interpretables: al generar explicaciones textuales de sus decisiones, el modelo facilita la auditoria y depuracion de sistemas de planificacion de movimiento, algo critico para la certificacion de seguridad.
- Generacion de datos sinteticos de entrenamiento: las trazas de Chain-of-Causation y las trayectorias generadas pueden usarse para aumentar datasets de entrenamiento de otros modelos de conduccion, especialmente en escenarios dificiles de capturar en el mundo real.
- Asistente de conduccion interactivo: el modelo puede responder preguntas del conductor o del sistema sobre la escena actual (por ejemplo, "¿por que frena el vehiculo?") y proporcionar una explicacion razonada, util para sistemas de asistencia avanzada (ADAS).
- Investigacion en VLA (vision-language-action): sirve como plataforma de referencia para estudiar como combinar razonamiento de alto nivel con control de bajo nivel en sistemas roboticos, dado que su arquitectura separa claramente el backbone de razonamiento del decodificador de acciones.
- Simulacion de conduccion en bucle cerrado: el modelo puede integrarse en simuladores para generar comportamientos de vehiculos virtuales realistas, incluyendo la interaccion con otros agentes, gracias a su capacidad de procesar multiples camaras y generar trayectorias coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (como MMLU, HumanEval o metricas especificas de conduccion) ni comparaciones con otros modelos. Se recomienda consultar el repositorio oficial de NVIDIA para futuras publicaciones de evaluacion.

## Requisitos de hardware

- VRAM minima: 24 GB (segun la model card, se requiere al menos 1 GPU con 24 GB de VRAM para cargar el modelo de 10B parametros).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) o GPUs profesionales con memoria suficiente.
- Compatibilidad con GPU de consumo: si, una RTX 4090 con 24 GB puede cargar el modelo en precision FP16, aunque con margen limitado para batch grande o contexto largo.
- Opciones de despliegue: PyTorch 2.8+, Hugging Face Transformers 4.57.1+, DeepSpeed 0.17.4+. No se menciona soporte para vLLM, llama.cpp u Ollama en la documentacion oficial.
- Sistema operativo: Linux (no probado en otros sistemas).
- Latencia y throughput: no disponible. El modelo requiere aceleracion GPU para un rendimiento practico; no se han publicado cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos VLA de conduccion autonoma. El modelo es una evolucion de Alpamayo 1 (tambien de NVIDIA, 10B parametros), que ya ofrecia razonamiento Chain-of-Causation pero sin soporte de navegacion ni respuesta a preguntas. La version 1.5 anade estas capacidades y mejora el post-entrenamiento con RL. No se han encontrado modelos comparables de otros fabricantes con especificaciones publicas equivalentes en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia OpenMDW-1.1 solo permite uso no comercial. Cualquier uso comercial requiere un acuerdo explicito con NVIDIA, lo que limita su adopcion en entornos empresariales sin negociacion previa.
- Idioma limitado: el modelo solo soporta ingles. No se ha entrenado ni evaluado en otros idiomas, lo que restringe su uso en entornos multilingues.
- Configuracion de entrada fija: aunque soporta multiples camaras, el modelo esta entrenado y probado principalmente con 4 camaras, resolucion de 320x576 y una ventana de historial de 0,4 segundos. Desviarse de esta configuracion puede degradar el rendimiento.
- Riesgo de alucinacion en razonamiento: como todo modelo de lenguaje, puede generar explicaciones plausibles pero incorrectas sobre la escena, lo que es especialmente peligroso en un contexto de conduccion donde las decisiones deben ser fiables.
- Sesgos de datos: los datos de entrenamiento provienen principalmente de entornos de conduccion de NVIDIA y datasets publicos, lo que puede introducir sesgos geograficos, climaticos o de estilo de conduccion.
- Requisitos de hardware: necesita al menos 24 GB de VRAM, lo que excluye GPUs de consumo de gama baja y dificulta su despliegue en edge computing.
- Sin garantias de seguridad: la model card advierte explicitamente que el modelo no ha sido validado para despliegue en vehiculos reales y que se requiere testing adicional especifico para cada caso de uso.
- Version desactualizada: NVIDIA ya ha publicado una version mas reciente (Alpamayo2-Super), por lo que esta version puede carecer de mejoras posteriores.

## Enlaces

- Modelo en HuggingFace (version oficial): https://huggingface.co/nvidia/Alpamayo-1.5-10B
- Modelo en HuggingFace (espejo, objeto de esta ficha): https://huggingface.co/Rohith67/Alpamayo-1.5-10B
- Repositorio de codigo: https://github.com/NVlabs/alpamayo1.5
- Repositorio de la version anterior (Alpamayo 1): https://github.com/NVlabs/alpamayo
- Pagina oficial de NVIDIA sobre Alpamayo: https://www.nvidia.com/en-us/solutions/autonomous-vehicles/alpamayo/
- Modelo base Cosmos-Reason2-8B: https://huggingface.co/nvidia/Cosmos-Reason2-8B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
