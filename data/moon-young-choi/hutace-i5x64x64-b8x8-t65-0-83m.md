# Moon-Young-Choi/HUTACE-I5x64x64-B8x8-T65-0.83M

## Resumen

HUTACE (Hybrid U-Net–Transformer Actor–Critic for Exploration) es un modelo de aprendizaje por refuerzo desarrollado por Moon-Young-Choi que selecciona waypoints locales para tareas de exploración de cobertura en terrenos 2.5D parcialmente observados, con restricciones de energía. El problema que resuelve es la toma de decisiones secuenciales en entornos donde el agente solo dispone de una observación parcial del terreno y debe maximizar el área cubierta sin quedarse sin combustible.

El modelo combina una arquitectura U-Net con un transformer espacial: una entrada de estado de 5×64×64 canales pasa por un cuello de botella U-Net de 8×8, seguido de 64 tokens espaciales más un token de resumen (T65), dos capas de transformer y cuatro cabezas de atención. Con exactamente 833.795 parámetros, es un modelo compacto diseñado para inferencia eficiente en hardware modesto. Su relevancia radica en abordar la exploración con observación parcial, un problema común en robótica y vehículos autónomos, donde los métodos heurísticos tradicionales suelen quedarse cortos.

El modelo se distribuye como checkpoint de PyTorch con pesos en formato safetensors, acompañado de un paquete de inferencia reproducible y un benchmark congelado basado en datos de terreno Mapzen. No se trata de un modelo de lenguaje ni de visión general, sino de un sistema especializado en planificación de exploración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida U-Net–Transformer Actor-Crítico (HUTACE) |
| Parametros totales | 833.795 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa un estado de 5×64×64 en lugar de secuencias de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | No disponible |
| Formato de pesos | Safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida que combina una U-Net con un transformer. La entrada es un tensor `float32[5,64,64]` que codifica cinco canales: elevación relativa observada normalizada, máscara de celdas observadas, mapa one-hot de la posición actual, recuento de visitas normalizado y ratio de combustible restante. La U-Net procesa esta representación con un cuello de botella de 8×8, y el resultado se proyecta a 64 tokens espaciales más un token de resumen (de ahí la nomenclatura T65). Dos capas de transformer con cuatro cabezas de atención procesan estos tokens para producir 4.096 logits de waypoint y un valor crítico escalar.

El entrenamiento utiliza un esquema actor-crítico con PPO (Proximal Policy Optimization), como se infiere de la comparación con variantes "Plain U-Net PPO" y "CNN PPO" en el benchmark. Los datos de terreno provienen de Mapzen Terrain Tiles (AWS Open Data), que combina múltiples DEM regionales; las teselas de zoom 13 se remuestrean a una rejilla de simulación de 30 m en UTM local. No se especifican el número total de pasos de entrenamiento ni la composición exacta del dataset, pero el checkpoint de despliegue se seleccionó únicamente por rendimiento en validación (semilla 3523, actualización 200). No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de control, no de lenguaje.

## Capacidades

- Selección de waypoints locales: el modelo devuelve 4.096 logits de waypoint a partir de un estado parcialmente observado, permitiendo elegir la siguiente posición de exploración.
- Manejo de observación parcial: la política solo recibe información de las celdas ya observadas; la elevación no observada no está disponible para el agente.
- Salida actor-crítico: produce simultáneamente una distribución sobre acciones (logits) y un valor crítico que estima el retorno esperado.
- Compatibilidad con máscaras de acción: se aplica una máscara local de acciones antes de seleccionar la acción determinista (argmax), lo que permite restringir el espacio de acciones a waypoints válidos.
- Eficiencia computacional: inferencia de 3,06 ms por muestra en GPU Tesla T4 con batch 1, y 0,291 ms por muestra con batch 128.
- Reproducibilidad: el paquete de inferencia incluye scripts de ejemplo y un hash SHA-256 para verificar la integridad de los pesos.

## Casos de uso

- Planificación de rutas de exploración para robots terrestres: el modelo puede integrarse en un bucle de control donde, dado un mapa parcial de elevación y el estado de combustible, selecciona el siguiente waypoint para maximizar la cobertura del terreno. Su bajo coste computacional permite ejecutarlo en tiempo real en plataformas embarcadas.
- Simulación de estrategias de cobertura con energía limitada: en entornos simulados (por ejemplo, Gazebo o MuJoCo), el modelo sirve como política de referencia para comparar con heurísticas como "nearest frontier" o "expected gain", gracias a su benchmark congelado.
- Evaluación de algoritmos de aprendizaje por refuerzo: al ser un checkpoint actor-crítico entrenado con PPO, puede utilizarse como baseline para investigar nuevas arquitecturas o funciones de recompensa en problemas de exploración parcialmente observables.
- Análisis de generalización en terrenos reales: los datos de Mapzen permiten probar el modelo en distintos tipos de orografía (montaña, llanura, costa) y estudiar su robustez ante variaciones en la elevación.
- Optimización de misiones de reconocimiento aéreo o terrestre: en misiones donde un dron o vehículo debe cubrir un área con presupuesto energético fijo, el modelo puede generar waypoints que equilibren cobertura y consumo.
- Investigación en aprendizaje por refuerzo con observación parcial: el modelo sirve como caso de estudio de arquitecturas híbridas CNN-transformer para estados espaciales, ya que combina extracción de características locales con razonamiento global mediante atención.

## Benchmarks y rendimiento

La model card proporciona resultados sobre un benchmark congelado de terrenos Mapzen. Las métricas incluyen cobertura final, AUC de cobertura-energía, cobertura en el paso 320 y energía consumida hasta alcanzar el 50% de cobertura (censurada, menor es mejor). La tabla siguiente reproduce los valores publicados.

| Metodo | Cobertura final | AUC cobertura-energia | Cobertura en paso 320 | Energia hasta 50% (censurada, menor es mejor) |
|---|---:|---:|---:|---:|
| **HUTACE** | **0,7712** | **0,5213** | **0,5884** | **302,12** |
| Plain U-Net PPO | 0,6679 | 0,4511 | 0,5090 | 369,77 |
| CNN PPO | 0,5454 | 0,4062 | 0,4725 | 408,95 |
| Nearest frontier | 0,6114 | 0,3557 | 0,3636 | 494,37 |
| Random local waypoint | 0,4287 | 0,2684 | 0,2830 | 590,17 |
| Expected gain / estimated energy | 0,1405 | 0,1305 | 0,1402 | 612,55 |

El modelo supera a las alternativas listadas en todas las métricas, aunque el autor no realiza una afirmación universal de estado del arte. En cuanto a eficiencia, en una GPU Tesla T4 con PyTorch 2.11.0, la política representativa (semilla 523) promedió 3,06 ms para batch 1 en GPU y 0,291 ms por muestra para batch 128. La latencia en CPU monohilo fue de 10,81 ms para batch 1, y el paso de simulación del entorno promedió 1,09 ms. Estas mediciones son específicas del entorno y no constituyen garantías universales.

## Requisitos de hardware

- El modelo tiene solo 833.795 parámetros, por lo que su huella de memoria es mínima: en float32 ocupa aproximadamente 3,3 MB de VRAM, y en float16 unos 1,7 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM, incluidas GPUs integradas.
- Inferencia medida en Tesla T4 (16 GB): 3,06 ms por muestra en batch 1, 0,291 ms por muestra en batch 128. En GPUs consumer como RTX 3060 o superiores, la latencia será similar o menor.
- Puede ejecutarse también en CPU: latencia de 10,81 ms por muestra en monohilo, suficiente para aplicaciones no tiempo real.
- Despliegue recomendado con PyTorch estándar, usando los scripts de inferencia incluidos en el repositorio (`load_model` y `select_action`). No se proporcionan integraciones específicas con vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- El cuello de botella no es la inferencia del modelo, sino la simulación del terreno (1,09 ms por paso en CPU), por lo que el sistema completo puede ejecutarse en tiempo real en hardware modesto.

## Comparativa con modelos similares

El propio benchmark del autor compara HUTACE con varias alternativas de la misma categoría (políticas de exploración con observación parcial). La comparación se basa en el rendimiento sobre el conjunto de prueba congelado de Mapzen.

| Metodo | Parametros (aprox.) | Arquitectura | Cobertura final | AUC cobertura-energia | Licencia |
|---|---|---|---:|---:|---:|
| **HUTACE** | 0,83 M | U-Net + Transformer | 0,7712 | 0,5213 | No disponible |
| Plain U-Net PPO | No disponible | U-Net | 0,6679 | 0,4511 | No disponible |
| CNN PPO | No disponible | CNN | 0,5454 | 0,4062 | No disponible |
| Nearest frontier | 0 (heurística) | Heurística | 0,6114 | 0,3557 | No aplica |
| Expected gain / estimated energy | 0 (heurística) | Heurística | 0,1405 | 0,1305 | No aplica |

No se dispone de información sobre los parámetros exactos de los modelos PPO comparados, ni de sus licencias. La comparativa se limita a los resultados publicados en la model card. No se han encontrado otros modelos comparables en la misma categoría (exploración con observación parcial y restricción energética) en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un sistema de navegación. No debe controlar directamente un rover, vehículo, dron o sistema crítico de seguridad.
- El simulador de energía relativa no está calibrado para un rover específico; las métricas de energía no son directamente trasladables a hardware real.
- Se considera que toda pendiente finita es transitable; no hay límite máximo de pendiente, reserva de combustible ni restricción de retorno al punto de inicio.
- La evaluación solo respalda la generalización interna a terrenos Mapzen; no se garantiza rendimiento en otros tipos de terreno o resoluciones.
- No se dispone de información sobre sesgos del modelo (por ejemplo, dependencia de ciertos tipos de orografía), ni sobre posibles alucinaciones, al no ser un modelo generativo de texto.
- La licencia no está especificada, por lo que el uso comercial queda sujeto a consulta con el autor.
- El modelo no soporta tool calling, ni razonamiento multi-paso en lenguaje natural, ni capacidades de visión general; es un sistema especializado en una única tarea.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Moon-Young-Choi/HUTACE-I5x64x64-B8x8-T65-0.83M
- Demo 3D interactiva: https://huggingface.co/spaces/Moon-Young-Choi/HUTACE-3D-Explorer
- Dataset benchmark congelado: https://huggingface.co/datasets/Moon-Young-Choi/HUTACE_Mapzen_Benchmark
- Fuente de datos de terreno (Mapzen Terrain Tiles): https://registry.opendata.aws/terrain-tiles/
- Perfil de GitHub del autor: https://github.com/Moon-Young-Choi (no específico del modelo)
- Documentación de atribución de Mapzen: referenciada en `docs/mapzen_attribution.md` dentro del repositorio (no enlazada directamente)
