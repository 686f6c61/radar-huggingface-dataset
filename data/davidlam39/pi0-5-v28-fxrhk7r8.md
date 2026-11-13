# davidlam39/pi0.5-v28-fxrhK7r8

## Resumen

π0.5 AXIS policy — OpenRoboto SN80 simulation track (AXIS v2.8) es un checkpoint derivado del modelo de política robótica π0.5, publicado por el usuario davidlam39 en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de una política de control para un entorno de simulación robótica denominado AXIS (versión 2.8). El modelo parte del snapshot campeón oficial de la temporada anterior de OpenRoboto (`openroboto-ai/champion-sim-11`, con puntuación 0.9320 en AXIS v2.7) y aplica un ajuste fino supervisado sobre rollouts del propio modelo padre.

La arquitectura subyacente es π0.5, un modelo de flow-matching con un "action expert" dedicado, entrenado mediante la receta `pi05_axis_joint` de OpenPI. El ajuste fino se realizó durante 2.000 pasos con batch de 32, learning rate 5e-6 con decaimiento coseno hasta 5e-7, y los pesos publicados son una interpolación lineal entre el padre y el modelo ajustado (factor 0,5). El repositorio ocupa 12,4 GB.

Su relevancia es acotada: se trata de un artefacto de investigación para la competición OpenRoboto, no de un modelo de propósito general. La model card es explícita al señalar que el resultado local "no es una puntuación oficial" y que el modelo no ha sido entrenado en las tareas añadidas en v2.8. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (flow-matching con action expert, receta OpenPI `pi05_axis_joint`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 12,4 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en π0.5, una política de control robótico que combina un modelo base con un "action expert" entrenado mediante flow-matching. El ajuste fino aplicado por el autor sigue la receta `pi05_axis_joint` de OpenPI: 2.000 pasos, batch de 32, learning rate 5e-6 con decaimiento coseno hasta 5e-7, muestras alineadas a chunk en los pasos de replanificación y sin aumento de imagen. El tiempo de flow-matching se restringió a t ≤ 0,9 para no entrenar directamente el primer paso de muestreo del padre.

Los datos de entrenamiento consisten en 1.929 rollouts exitosos en bucle cerrado del propio modelo padre sobre las instancias congeladas publicadas de AXIS v2.7 (97 tareas; solo variantes 0–14, reservando las variantes 15–19 para selección). La grabación siguió el protocolo del evaluador: 120 controles, replanificación cada 10 pasos, cámara base y cámara de muñeca. Los pesos liberados son la interpolación `parent + 0.5 · (fine-tuned − parent)`. Las estadísticas de normalización en `assets/` son las del padre, sin modificar. El checkpoint se seleccionó sobre las variantes reservadas 15–19.

## Capacidades

- Control robótico en simulación: genera acciones de control (120 controles por episodio) para las tareas del entorno AXIS v2.7.
- Replanificación periódica: opera con un bucle de replanificación cada 10 pasos.
- Percepción multimodal: utiliza cámara base y cámara de muñeca como entradas.
- Aprendizaje por imitación: entrenado sobre rollouts exitosos del modelo padre, no sobre datos humanos.
- Interpolación de pesos: permite mezclar el comportamiento del padre y del ajuste fino mediante un factor escalar.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en competición robótica simulada: el modelo sirve como punto de partida o referencia para participantes de OpenRoboto que quieran comparar o continuar el ajuste fino sobre AXIS v2.7.
- Estudio de métodos de ajuste fino con flow-matching: la receta documentada (pasos, learning rate, restricción t ≤ 0,9) es replicable y útil para investigar estabilidad del entrenamiento en políticas de control.
- Análisis de interpolación de pesos: el factor 0,5 entre padre y ajuste permite estudiar el compromiso entre conservar comportamiento previo y adaptarse a nuevos datos.
- Evaluación de generalización: las variantes reservadas 15–19 permiten medir si el ajuste fino degrada el rendimiento fuera de distribución.
- Reproducción de experimentos de imitación: los 1.929 rollouts y el protocolo de grabación documentado facilitan la replicación del pipeline.
- Línea base para políticas derivadas: al ser un checkpoint intermedio, puede servir como inicialización para ajustes posteriores sobre AXIS v2.8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que, sobre las variantes reservadas 15–19 de las 100 tareas de AXIS v2.7 con 4 ensayos cada una, el modelo está "a la par con el padre dentro del ruido". No se proporcionan cifras numéricas ni comparaciones tabuladas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 12,4 GB, lo que da una cota inferior aproximada para cargar los pesos en precisión nativa, pero no se especifica la cuantización ni el consumo real).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una política robótica, el despliegue típico sería mediante OpenPI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidlam39/pi0.5-v28-fxrhK7r8 | no disponible | no disponible | a la par con el padre en variantes 15–19 (sin cifras) | Apache 2.0 | Hugging Face |
| openroboto-ai/champion-sim-11 (padre) | no disponible | no disponible | 0,9320 en AXIS v2.7 | no disponible | Hugging Face |
| pfenzi/king (origen del padre) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar parámetros, contexto ni latencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- El resultado local no es una puntuación oficial: la model card lo señala explícitamente.
- El modelo no ha sido entrenado en las tareas añadidas en AXIS v2.8, por lo que su comportamiento en ellas es incierto.
- El ajuste fino se realizó solo sobre las variantes 0–14; las variantes 15–19 se reservaron para selección, lo que introduce un posible sesgo de selección.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas, pero al ser un modelo de control robótico estas categorías no aplican de forma directa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de un padre cuya licencia no se detalla en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Los pesos son una interpolación al 0,5, no el modelo ajustado completo; el comportamiento puede diferir del de un ajuste fino sin interpolar.
- No se especifican formatos de pesos, cuantizaciones ni herramientas de despliegue, lo que dificulta la integración en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidlam39/pi0.5-v28-fxrhK7r8
- Padre canónico: https://huggingface.co/openroboto-ai/champion-sim-11/tree/0a7e6e31edbc20544d6fd190100cc23ef80ff539
- Origen del padre: https://huggingface.co/pfenzi/king
- OpenPI (receta `pi05_axis_joint`): no disponible en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
