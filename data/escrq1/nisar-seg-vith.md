# EscRq1/nisar-seg-vith

## Resumen

NISAR SAR Change Detector es un modelo de investigación publicado por el usuario EscRq1 en Hugging Face que detecta cambios en la retrodispersión radar entre dos adquisiciones solapadas de NISAR L2 GCOV. El modelo recibe datos radar HH y HV co-registrados de una adquisición temprana (T0) y otra posterior (T1), y produce un mapa de puntuaciones de cambio a nivel de píxel que el explorador local umbraliza para generar una máscara de cambio.

Técnicamente se apoya en un codificador compartido ViT-H/14 que procesa ambas fechas, adaptado a datos NISAR mediante preentrenamiento con autoencoder enmascarado (masked autoencoder). Una cabeza convolucional fusiona las características de las dos fechas y predice las puntuaciones de cambio. El detector opera sobre teselas solapadas de 224 × 224 píxeles que el runtime mezcla en un mapa continuo de puntuaciones.

El modelo es relevante en el contexto de la teledetección SAR y la monitorización medioambiental, donde la detección automática de cambios entre pasadas de satélite es una tarea clave para seguimiento de inundaciones, deforestación o cambios de uso del suelo. No obstante, se trata de un modelo de investigación con cero descargas y sin métricas de validación independiente publicadas, por lo que su uso en producción requiere precaución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-H/14 (codificador compartido) + cabeza convolucional de fusión |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada por teselas de 224 × 224 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión/radar, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`detector.safetensors`) |

## Arquitectura y entrenamiento

El modelo emplea un codificador ViT-H/14 compartido entre las dos fechas de adquisición, adaptado al dominio NISAR mediante preentrenamiento con autoencoder enmascarado. Sobre las características extraídas de T0 y T1, una cabeza convolucional realiza la fusión y predice una puntuación de cambio por píxel. La inferencia se ejecuta sobre teselas solapadas de 224 × 224 píxeles que posteriormente se mezclan para producir un mapa continuo de puntuaciones.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO (no aplicables en este dominio). El checkpoint `detector.safetensors` incluye el codificador compartido, la cabeza convolucional de cambio y los metadatos de configuración y normalización del detector en un formato propio del proyecto.

## Capacidades

- Detección de cambios en retrodispersión radar entre dos adquisiciones NISAR L2 GCOV co-registradas.
- Procesamiento conjunto de polarizaciones HH y HV.
- Generación de mapas de puntuación de cambio a nivel de píxel.
- Umbralización configurable para producir máscaras de cambio binarias.
- Medición de estadísticas derivadas como cobertura válida y cambios emparejados HH/HV.
- Cálculo de diferencias con signo (T1 − T0) para evaluar la dirección del cambio.
- Operación sobre regiones de interés (ROI) definidas por coordenadas en píxeles nativos de T0.
- No dispone de tool calling, capacidades de agente ni soporte multilingüe (es un modelo de visión/radar).

## Casos de uso

- Monitorización de inundaciones: el detector puede señalar píxeles donde la retrodispersión radar cambió entre dos pasadas, lo que en zonas llanas y con cobertura HH/HV puede indicar presencia de agua superficial; requiere validación con observaciones independientes para confirmar la causa.
- Seguimiento de cambios de uso del suelo: comparando adquisiciones T0 y T1 sobre una misma ROI se obtienen máscaras de cambio que pueden priorizar áreas para inspección manual en estudios de deforestación o expansión urbana.
- Investigación en teledetección SAR: sirve como componente de experimentación para evaluar técnicas de detección de cambios basadas en ViT y preentrenamiento autoencoder enmascarado sobre datos NISAR.
- Análisis de series temporales de radar: integrado en pipelines que ingieren pares de productos GCOV, permite generar mapas de cambio sistemáticos sobre regiones de interés recurrentes.
- Validación de co-registro y calidad de datos: las estadísticas de cobertura válida y cambios emparejados HH/HV que produce el explorador ayudan a diagnosticar problemas de alineación entre adquisiciones.
- Docencia y prototipado: al ejecutarse localmente con un launcher y un explorador web, es adecuado para demostraciones de detección de cambios SAR en entornos académicos.
- Priorización de inspecciones: las máscaras de cambio pueden usarse como filtro previo para dirigir la revisión humana hacia las zonas con mayor probabilidad de cambio, reduciendo el volumen de escenas a inspeccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el detector fue evaluado contra objetivos de cambio generados automáticamente, sin que se haya establecido su precisión en escenas revisadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,5 GB, lo que sugiere que el checkpoint en safetensors requiere al menos varios GB de memoria, pero no se confirma la cifra exacta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; un ViT-H/14 suele requerir GPU con memoria suficiente, pero no hay datos publicados para este checkpoint concreto.
- Opciones de despliegue: el proyecto proporciona su propio runtime (`launch.py`, `inference.py`) y un explorador web local en `http://127.0.0.1:8000`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de cambios SAR con los que establecer una comparación fiable de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La máscara de cambio no identifica la dirección ni la causa del cambio; para evaluar la dirección deben usarse las mediciones con signo T1 − T0 y observaciones independientes para investigar causas físicas.
- Las puntuaciones del detector no son probabilidades calibradas.
- El modelo no debe usarse como mapa autónomo de inundaciones ni de cobertura del suelo.
- La precisión en escenas revisadas de forma independiente no ha sido establecida; la evaluación se realizó contra objetivos de cambio generados automáticamente.
- Licencia no especificada, lo que impide confirmar si se permite el uso comercial.
- Modelo de investigación con cero descargas y cero likes en el momento de la consulta; madurez y mantenimiento inciertos.
- Requiere datos de entrada muy específicos (productos NISAR L2 GCOV con HH y HV co-registrados) y un formato de checkpoint propio que solo carga el código del explorador del proyecto.
- El directorio de salida debe ser nuevo y las coordenadas de ROI usan píxeles nativos de T0 con límites derecho e inferior exclusivos, lo que exige cuidado en la integración.
- No se dispone de información sobre sesgos del modelo, ya que no es un modelo lingüístico y no se documentan sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EscRq1/nisar-seg-vith
- Repositorio del proyecto (NISAR SAR Change Explorer): https://github.com/kimannavalerevna/nasa-nisar-project
- Explorador local: http://127.0.0.1:8000 (solo tras lanzar el runtime en local)
