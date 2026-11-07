# asferrer/gemma-4-E2B-it-oceanguard-marine-debris

## Resumen

El modelo `asferrer/gemma-4-E2B-it-oceanguard-marine-debris` es un adaptador LoRA de tipo PEFT sobre `google/gemma-4-E2B-it`, desarrollado por el autor asferrer en el contexto del hackathon Kaggle Gemma 4 Good (pista Global Resilience). Su proposito es adaptar un modelo multimodal de Google a la deteccion open-vocabulary de residuos marinos de origen antropico, devolviendo un contrato de salida estructurado en JSON con cajas delimitadoras (`box_2d` en rejilla 0-1000) y etiquetas de ocho clases: `plastic_bottle`, `metal_can`, `fishing_net`, `glove`, `face_mask`, `metal_debris`, `plastic_debris` y `tire`. El adaptador es el artefacto de entrenamiento de la aplicacion Android OceanGuard AI, que ejecuta el modelo de forma totalmente offline en hardware movil.

El modelo base es Gemma 4 E2B en su variante instruct, con aproximadamente 4.650 millones de parametros totales segun el recuento de safetensors del repositorio. El adaptador LoRA tiene rango 16 y alpha 32, sin dropout, y se aplica sobre las proyecciones de atencion (`q/k/v/o_proj`) y MLP (`gate/up/down_proj`). Se entreno con QLoRA (base cuantizada a 4 bits) y Unsloth en bf16. El repositorio incluye, ademas del adaptador, una version fusionada y cuantizada a GGUF Q4_K_M (unos 3,4 GB, solo decodificador de texto) y una exportacion LiteRT-LM con cuantizacion int8 (unos 5,0 GiB, con codificador visual).

La relevancia del modelo esta en su enfoque de despliegue: demuestra que un VLM de 4,6 mil millones de parametros puede adaptarse a una taxonomia ambiental especifica y ejecutarse en un dispositivo Android sin conexion, con una mejora medible en deteccion de residuos marinos (mAP@0.5 de 0,1381 a 0,2941 sobre un conjunto de test de 200 imagenes). Es un caso practico de IA ambiental en el borde, con limitaciones claras de rendimiento absoluto y de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) con adaptador LoRA PEFT sobre atencion y MLP |
| Parametros totales | 4.647.450.147 (recuento safetensors del repositorio) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LoRA sin cuantizar (bf16), GGUF Q4_K_M (5,88 bits por peso), LiteRT-LM int8 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF, litertlm |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 de Google que combina un decodificador de texto con un codificador visual. El adaptador es un LoRA estandar de PEFT con rango 16, alpha 32 y sin dropout, inyectado en las proyecciones de atencion (`q/k/v/o_proj`) y en las proyecciones MLP (`gate/up/down_proj`). El entrenamiento empleo QLoRA sobre la base cuantizada a 4 bits, con Unsloth en bf16. El adaptador resultante ocupa aproximadamente 119 MB.

El corpus de entrenamiento suma 15.245 imagenes y 40.623 instancias (21.123 reales y 19.500 sinteticas, un 33 % sintetico). Las imagenes reales provienen de tres fuentes publicas de residuos marinos: CleanSea (767 imagenes, corpus introducido por el propio autor), Neural_Ocean (3.129) y Ocean_garbage (6.349), todas con anotaciones COCO mapeadas a las ocho clases del contrato. Las 5.000 imagenes sinteticas (19.500 instancias) se generaron mediante composicion copy-paste con un generador propio (muestreo aleatorio con semilla 42). La particion del corpus se realizo por grupos, de modo que ninguna imagen del conjunto de test comparte grupo con imagenes de entrenamiento. No se documenta en la informacion disponible el uso de RLHF o DPO; el ajuste es supervisado sobre el contrato de salida JSON.

## Capacidades

- Deteccion open-vocabulary de residuos marinos con salida JSON estructurada: array de objetos `{box_2d, label, material}` con coordenadas en rejilla 0-1000.
- Clasificacion en ocho clases de residuos: `plastic_bottle`, `metal_can`, `fishing_net`, `glove`, `face_mask`, `metal_debris`, `plastic_debris` y `tire`.
- Procesamiento de imagen a texto (pipeline `image-to-text`) con codificador visual integrado en la exportacion LiteRT-LM (140 tokens de vision).
- Soporte de function calling nativo de Gemma 4, utilizado por la aplicacion OceanGuard AI para consultar una interfaz Kotlin tipada dentro de una conversacion LiteRT-LM.
- Capacidades conversacionales y de razonamiento heredadas del modelo base instruct.
- Ejecucion totalmente offline en dispositivo (edge AI, movil, on-device).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Ciencia ciudadana costera: la aplicacion Android OceanGuard AI permite a voluntarios fotografiar residuos en playas y obtener detecciones etiquetadas sin conexion, con el modelo ejecutandose en el propio telefono mediante LiteRT-LM int8.
- Operaciones de campo de ONG: equipos en zonas remotas sin cobertura pueden procesar imagenes de residuos en el dispositivo y generar informes estructurados que se sincronizan posteriormente.
- Monitorizacion costera con dron o camara fija: el adaptador puede integrarse en un pipeline de inferencia por lotes para clasificar imagenes de campanas de limpieza y agregar estadisticas por clase de residuo.
- Componente de grounding en pipelines agénticos de informes: el function calling nativo de Gemma 4 permite que el modelo consulte hechos tipados (recuentos, familias de impacto ecologico) en lugar de copiar cifras agregadas, reduciendo el riesgo de datos fabricados en informes para administraciones.
- Linea base de investigacion en deteccion open-vocabulary sobre taxonomias ambientales especializadas: el adaptador y su particion por grupos sirven como referencia reproducible para comparar metodos de adaptacion de VLMs a dominios concretos.
- Triaje y priorizacion de limpieza: clasificacion rapida de imagenes en categorias de impacto para que un operador humano priorice intervenciones, sin que el modelo tome decisiones autonomas.
- Aplicaciones educativas o de concienciacion ambiental: analisis de imagenes en talleres y actividades de divulgacion con retroalimentacion inmediata y sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Adaptador | Modelo base |
|---|---|---|---|---|
| Deteccion de residuos marinos (open-vocabulary, 8 clases) | OceanGuard TEST-200 (particion group-aware de CleanSea + Ocean_garbage + Neural_Ocean) | mAP@0.5 | 0,2941 | 0,1381 |

La diferencia pareada es de +0,156 con un intervalo bootstrap del 95 % de [0,045, 0,178], aproximadamente 2,1 veces superior. El adaptador se selecciono como la mejor de tres configuraciones LoRA por su mAP en un subconjunto separado de 100 imagenes (VAL-100); en TEST-200 las tres configuraciones son estadisticamente indistinguibles segun el autor. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Adaptador LoRA: aproximadamente 119 MB en safetensors; requiere cargar el modelo base `google/gemma-4-E2B-it` completo (unos 4,65 mil millones de parametros) para inferencia con PEFT.
- GGUF Q4_K_M: unos 3,4 GB en disco; solo decodificador de texto, compatible con llama.cpp. Cabe en dispositivos moviles de gama alta y en GPUs consumer con al menos 4-6 GB de VRAM libre.
- LiteRT-LM int8: 5.245.718.144 bytes (unos 5,0 GiB); incluye codificador visual (140 tokens de vision), sin decodificacion especulativa. Disenado para ejecucion en Android.
- GPU recomendadas: no disponible de forma explicita en la informacion proporcionada. Para el adaptador sin cuantizar en precision completa se requiere una GPU con suficiente VRAM para los 4,65 mil millones de parametros (orientativamente 10 GB o mas en bf16), aunque este dato no se declara.
- Cabe en GPU consumer: si, en formato GGUF Q4_K_M y en LiteRT-LM int8; el adaptador PEFT completo requiere una GPU de gama media-alta.
- Opciones de despliegue: llama.cpp (GGUF), LiteRT-LM (Android), PEFT/Unsloth con Transformers para el adaptador. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: la model card indica latencia del orden de segundos por imagen; no se proporcionan cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oceanguard-marine-debris | 4,65 B (+ LoRA r=16) | no disponible | VLM adaptado a deteccion de residuos marinos, edge | Apache 2.0 | Hugging Face (adaptador, GGUF, litertlm) |
| google/gemma-4-E2B-it (base) | 4,65 B | no disponible | VLM generalista instruct | no disponible en la informacion | Hugging Face |
| Adaptadores genericos de deteccion open-vocabulary | no disponible | no disponible | Deteccion general sin especializacion ambiental | variable | variable |

No se dispone en la informacion proporcionada de comparativas con otros modelos especializados en deteccion de residuos marinos ni con alternativas de la misma categoria con datos de rendimiento equiparables. La comparacion cuantitativa disponible se limita al modelo base, con la mejora de mAP@0.5 descrita en la seccion de benchmarks.

## Limitaciones y advertencias

- Rendimiento absoluto moderado: un mAP@0.5 de 0,2941 sobre TEST-200 indica que la deteccion dista de ser fiable para uso critico; es una herramienta de triaje, no de decision autonoma.
- Uso fuera de alcance: no debe emplearse para decision autonoma (despacho de limpieza, sanciones regulatorias, cumplimiento ambiental) ni para deteccion en tiempo real critica para la seguridad (evitacion de colisiones, navegacion).
- Especializacion estrecha: el adaptador desplaza el prior visual hacia residuos marinos y puede degradar el rendimiento en tareas de deteccion general fuera de ese dominio.
- Idioma: solo se declara soporte de ingles.
- Datos de entrenamiento con licencias heterogeneas: CleanSea permite uso no lucrativo de investigacion o educativo; Ocean_garbage y Neural_Ocean se rigen por los terminos de cada dataset en Roboflow Universe. Aunque el adaptador se publica con Apache 2.0, el uso comercial de los datos subyacentes debe revisarse por separado.
- Un 33 % del entrenamiento es sintetico (composicion copy-paste), lo que puede introducir sesgos de apariencia y artefactos no representativos del dominio real.
- Riesgo de alucinacion: como VLM generativo, puede producir cajas o etiquetas plausibles pero incorrectas; el contrato JSON reduce pero no elimina este riesgo. La aplicacion OceanGuard AI mitiga el problema de cifras fabricadas mediante function calling tipado.
- Seleccion de configuracion: el adaptador se eligio sobre VAL-100 y las tres configuraciones son indistinguibles en TEST-200, lo que limita la confianza en que sea la mejor opcion posible.
- Latencia del orden de segundos por imagen, incompatible con aplicaciones de tiempo real.
- Resultados de benchmarks declarados por el autor y no verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asferrer/gemma-4-E2B-it-oceanguard-marine-debris
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de la aplicacion OceanGuard AI: https://github.com/asferrer/OceanguardAI
- Articulo CleanSea (Sanchez-Ferrer et al., Pattern Recognition Letters 2023): https://www.sciencedirect.com/science/article/pii/S0167865522003889?via%3Dihub
- Articulo IbPRIA 2022: https://link.springer.com/chapter/10.1007/978-3-031-04881-4_49
- Dataset de evaluacion: https://huggingface.co/datasets/asferrer/oceanguard-marine-debris-eval-1000
