# 0xdhruva/engage3d-placement-v1

## Resumen

engage3d-placement-v1 es una red neuronal de muy pequeño tamaño (un ensemble de 3 MLP de aproximadamente 140.000 parámetros cada uno) desarrollada por 0xdhruva que corrige la colocación espacial de dos personas que interactúan entre sí en un escenario 3D reconstruido a partir de una única cámara. El modelo no genera cuerpos ni estima poses: recibe la salida de un pipeline previo (SAM 3D Body para cada cuerpo, un mapa de profundidad combinado de MoGe-2 y los huecos de SAM 3D Body, y residuales 2D de ViTPose+) y devuelve, para cada cuerpo, un desplazamiento de centro y una pequeña rotación que alinean la disposición del par con la realidad.

El problema que resuelve es concreto y técnico: en la reconstrucción monocular de interacciones entre dos personas, la profundidad relativa y la distancia entre cuerpos suelen ser imprecisas, lo que rompe la coherencia física de la escena (contactos, solapamientos, distancia real). Este módulo corrige ese sesgo de colocación sin reentrenar el resto del pipeline. Es relevante para investigación en visión 3D de interacciones humanas, no como modelo de lenguaje.

La arquitectura es deliberadamente ligera: MLP sobre características geométricas y de profundidad por vista, entrenada y evaluada sobre Harmony4D. No es un modelo multimodal ni un LLM, por lo que muchas de las filas de especificaciones habituales (contexto, cuantización, idiomas) no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 MLP (aprox. 140.000 parámetros cada uno) |
| Parametros totales | Aproximadamente 420.000 (3 x 140.000) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en `placement_v1.pt`) |
| Idiomas soportados | No aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |
| Entrada | 19 key points por cuerpo, desacuerdo de profundidad por región, residuales 2D de ViTPose+ |
| Salida | Desplazamiento de centro y rotación pequeña por cuerpo |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un ensemble de tres perceptrones multicapa (MLP) de unos 140.000 parámetros cada uno. Cada vista se representa mediante un vector de características que combina los 19 key points de ambos cuerpos, el desacuerdo por regiones entre el mapa de profundidad combinado y la geometría de SAM 3D Body, y los residuales 2D de ViTPose+; el bloque de solapamiento se descarta explícitamente según la model card. La salida es un desplazamiento de centro y una rotación pequeña por cuerpo, aplicados sobre la colocación inicial del pipeline.

El entrenamiento se realizó sobre Harmony4D (licencia MIT), con un par de atletas en situación de grappling de pie y datos de MMA. La evaluación es una prueba retenida pre-registrada sobre 4 secuencias no vistas (1.068 vistas). El autor advierte que SAM 3D Body fue entrenado con Harmony4D (los 24 sujetos), por lo que los errores absolutos son probablemente optimistas, aunque las comparaciones internas del experimento no se ven afectadas. No se documentan detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Corrección de colocación relativa de dos cuerpos en 3D a partir de una sola cámara.
- Ajuste fino de distancia entre personas, profundidad relativa y orientación mutua.
- Mejora de la coherencia de contacto entre superficies corporales (métrica F1 de superficies que se tocan).
- Integración como etapa final de un pipeline de reconstrucción (SAM 3D Body + MoGe-2 + ViTPose+).
- Funciona sobre características geométricas y de profundidad, no sobre píxeles crudos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un LLM).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3D de interacciones cuerpo a cuerpo en investigación: el modelo corrige la distancia y la profundidad relativa entre dos personas captadas por una sola cámara, lo que permite estudiar contacto y disposición espacial en deportes de grappling o MMA con mayor fidelidad.
- Post-procesado de pipelines de captura de movimiento monocular: se inserta tras SAM 3D Body y el mapa de profundidad combinado para reducir el error de colocación sin reentrenar los modelos base.
- Análisis deportivo de contacto: la mejora en la F1 de superficies que se tocan (0,60 frente a 0,55 del pipeline sin el módulo) permite detectar de forma más fiable qué partes del cuerpo entran en contacto durante una técnica.
- Validación de sistemas de reconstrucción 3D: sirve como referencia de corrección geométrica para comparar variantes de profundidad o de estimación de pose en escenas con dos sujetos.
- Generación de datos sintéticos coherentes: al corregir la disposición del par, los esqueletos reconstruidos pueden usarse como base para animación o simulación con relaciones espaciales realistas.
- Investigación en percepción monocular de interacciones: el modelo es un componente ligero y reproducible (repo de 0,0 GB, licencia MIT) para experimentar con correcciones de colocación en escenas de dos personas.

## Benchmarks y rendimiento

Resultados de la prueba retenida pre-registrada sobre Harmony4D (4 secuencias no vistas, 1.068 vistas):

| Metrica | SAM 3D Body | Combined depth | + este modelo |
|---|---|---|---|
| Error mediano de distancia entre las dos personas | 11,2 cm | 3,95 cm | 3,17 cm |
| Error de profundidad relativa | 16,0 cm | 5,8 cm | 4,3 cm |
| F1 de superficies corporales que se tocan | 0,46 | 0,55 | 0,60 |

El autor indica que, sobre personas nuevas, aproximadamente dos tercios de la ganancia se transfiere. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el ensemble de 3 MLP de ~140.000 parámetros ocupa del orden de unos pocos MB en FP32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, A100, H100); el cuello de botella real del pipeline estará en SAM 3D Body, MoGe-2 y ViTPose+, no en este módulo.
- Cabe en GPU consumer: sí, en cualquier modelo con suficiente memoria para el resto del pipeline.
- Opciones de despliegue: PyTorch nativo mediante `load_model('placement_v1.pt')` del módulo `engage_place_train`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera que sean despreciables frente a las etapas previas del pipeline.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de corrección de colocación de pares humanos en 3D monocular en la documentación proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| engage3d-placement-v1 | ~420.000 | No aplica | Ver tabla de benchmarks | MIT | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado con un único par de atletas (grappling de pie) y datos de MMA; la generalización a otras personas y actividades es limitada (se transfieren aproximadamente dos tercios de la ganancia).
- Requiere cajas de persona ground-truth y los intrínsecos de cámara conocidos; no funciona en un escenario completamente no calibrado.
- Depende de la calidad de las etapas previas (SAM 3D Body, MoGe-2, ViTPose+); errores en ellas condicionan la corrección.
- Los errores absolutos reportados son probablemente optimistas porque SAM 3D Body se entrenó con Harmony4D (los 24 sujetos), según advierte el propio autor.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; no debe evaluarse con criterios de LLM.
- Licencia MIT para los pesos, pero las licencias de SAM 3D Body (SAM License), MoGe-2 y ViTPose+ aplican al pipeline completo y deben revisarse para uso comercial.
- Riesgo de alucinación no aplica; el riesgo es de corrección geométrica errónea en escenas fuera de distribución.
- Sin descargas ni likes en el momento de la consulta; ecosistema y validación externa inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xdhruva/engage3d-placement-v1
- Repositorio de código: https://github.com/dhruvinci/engage3d (código en `src/`, experimento en `experiments/E06-placement-model-v1`)
- Paper de SAM 3D Body citado por el autor: arXiv 2602.15989
- Dataset Harmony4D (MIT): no disponible enlace directo en la información proporcionada
- MoGe-2: no disponible enlace directo en la información proporcionada
- ViTPose+: no disponible enlace directo en la información proporcionada
