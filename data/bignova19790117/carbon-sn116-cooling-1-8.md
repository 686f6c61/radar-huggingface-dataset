# bignova19790117/carbon-sn116-cooling-1.8

## Resumen

Carbon Cooling 1.8 model `b7` es un modelo subrogado (surrogate model) desarrollado por el usuario `bignova19790117` para la competición Chip Cold Plate (Cooling) 1.8 de la subnet 116 de Bittensor, conocida como Carbon. El modelo resuelve un problema de transferencia de calor conjugada en una placa fría de chip: a partir de nueve entradas (cuatro valores de geometría de canal y cinco de condiciones de operación, incluidos posición e intensidad del punto caliente) predice la temperatura máxima del die, el perfil de temperatura a lo largo del canal en 30 segmentos y la caída de presión, todo en el formato de salida codificado de Carbon.

La arquitectura es híbrida y no es un transformer: combina un modelo analítico cerrado de física del canal (balance de energía del refrigerante con propiedades PG25, convección laminar en desarrollo con historial de flujo, eficiencia de aleta, conducción axial en cobre, fricción laminar con pérdida de entrada) con un ensamble de seis redes neuronales pequeñas (dos capas ocultas de 16 neuronas) que corrigen los residuos del modelo cerrado. Está implementado en JAX y se distribuye en el formato de grafo que consume el validador de Carbon, con un tamaño de 30.090 de los 32.768 bytes permitidos.

El modelo es relevante porque ejemplifica el paradigma de modelos subrogados compactos para competiciones de Bittensor, donde el presupuesto de tamaño es extremadamente restrictivo y la física del dominio debe incorporarse explícitamente. No obstante, conviene señalar que el autor indica explícitamente que el modelo no ha sido enviado ni calificado: Cooling 1.8 aún no tiene puerta de validador, por lo que no existe puntuación oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: modelo analítico cerrado de transferencia de calor conjugada + ensamble de seis redes neuronales pequeñas (2 capas ocultas de 16 neuronas) |
| Parámetros totales | No disponible (el modelo se mide por tamaño de grafo: 30.090 de 32.768 bytes permitidos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada de 9 valores escalares) |
| Tipos de cuantización | No disponible como cuantización estándar; el grafo almacena las redes de corrección como enteros de 16 bits |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Grafo de Carbon (`manifest.json` + documentos de grafo forward e init); fuente en JAX (`spec.py`), constantes en `model.json` y redes en `model_ens.npz` |

## Arquitectura y entrenamiento

La arquitectura combina un modelo físico cerrado que se marcha a lo largo del canal con un ensamble de seis redes neuronales pequeñas. El modelo cerrado implementa balance de energía del refrigerante con propiedades PG25, convección laminar en desarrollo con historial de flujo, eficiencia de aleta, conducción axial en el cobre, conducción en la base y fricción laminar con pérdida de entrada. Una pocas docenas de constantes se ajustan; el resto es física de manual. Las seis redes de corrección (dos capas ocultas de 16 neuronas cada una) corrigen lo que el modelo cerrado no captura: el exceso de pico en el die, el perfil y la caída de presión, promediando sus salidas. Las salidas usan la codificación segura de Carbon y se estandarizan con los objetivos del conjunto TRAIN.

El ajuste se realizó sobre el conjunto público TRAIN de Cooling 1.8 de Carbon (458 filas) y sobre aproximadamente 4.100 resoluciones de referencia generadas por el propio autor con el solver de referencia público de Carbon (OpenFOAM), tanto dentro como fuera de la caja publicada. El autor indica que nada en el grafo es un modelo preentrenado tomado de otro sitio. El modelo `b7` es la misma receta que sus predecesores `b5` y `b6`, reajustada sobre todas las filas disponibles (4.602), por lo que no quedan filas no vistas propias para evaluarlo; las métricas honestas son las de sus predecesores. El autor advierte que Carbon aún no ha registrado varios de los valores con los que se calificará Cooling 1.8 y que el conjunto TRAIN final se publica solo en el freeze de TRAIN, por lo que el modelo podría reajustarse.

## Capacidades

- Predicción de temperatura máxima del die (die peak temperature) a partir de geometría de canal y condiciones de operación.
- Predicción del perfil de temperatura a lo largo del canal en 30 segmentos.
- Predicción de la caída de presión (pressure drop) en la placa fría.
- Modelado de transferencia de calor conjugada con convección laminar en desarrollo, conducción axial y eficiencia de aleta.
- Manejo de posición e intensidad de punto caliente (hot-spot) entre las entradas de operación.
- Ejecución en el formato de grafo que consume el validador de Carbon (ruta de grafo 1.8 admitida localmente).
- Entrenamiento y respuesta de un caso por llamada en aproximadamente 0,05 s (medición local del autor).
- No dispone de tool calling, capacidades de agente, multilingüismo ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Optimización de geometría de placas frías en fase de diseño: el modelo evalúa en ~0,05 s por caso la temperatura de die y la caída de presión para distintas geometrías de canal, lo que permite barridos paramétricos y optimización iterativa sin lanzar OpenFOAM en cada evaluación.
- Selección de diseños cerca del límite térmico: según las mediciones del predecesor `b5`, el 99,9 % de las selecciones alcanzaron el mejor valor de diseño factible sobre 438 diseños no vistos cerca del límite de 100 °C en el die, lo que lo hace adecuado para menús de selección en campañas de optimización.
- Sustitución de simulaciones CFD en bucles de optimización: al incorporar física cerrada más correcciones neuronales, reduce el coste computacional frente al solver de referencia OpenFOAM en exploraciones de espacio de diseño.
- Evaluación rápida de condiciones de operación extremas: el modelo fue ajustado con resoluciones de referencia dentro y fuera de la caja publicada, lo que permite explorar escenarios fuera del rango nominal con cautela.
- Prototipado en campañas de la subnet 116 de Bittensor: el grafo `lowered_graph/` puede prepararse directamente en una campaña de Cooling 1.8 una vez que exista una puerta que sirva esa versión.
- Reproducción y auditoría del modelo: el `source/spec.py` puede bajarse con la herramienta propia de Carbon (`python -m carbon.level4.tooling lower ...`) para reproducir el grafo, lo que facilita la verificación por terceros.
- Estimación de perfiles térmicos para análisis de fiabilidad: la salida de perfil en 30 segmentos permite estudiar gradientes térmicos a lo largo del canal, útiles para evaluar fatiga térmica del sustrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la información disponible. El autor indica explícitamente que el modelo no ha sido enviado ni calificado y que no existe puntuación oficial de Carbon. Las siguientes son mediciones locales del autor, no calificaciones de Carbon:

| Comprobación | Resultado |
|---|---|
| Ruta de grafo 1.8 de Carbon, ejecución local | admitida; entrena y responde un caso por llamada en ~0,05 s |
| Seis diseños públicos de verificación de Carbon (nunca usados en ajuste) | error de pico en die: 0,052 °C mediana, 0,087 °C peor; potencia de bombeo: 0,8 % mediana |
| Predecesor `b6` sobre 167 resoluciones de punto caliente en borde no vistas | error de pico en die: 0,07–0,10 °C mediana; estimación de precisión 0,69 con escala de incertidumbre de 0,037 °C, 0,58 con 0,018 °C (modelo cerrado solo: 0,27 y 0,22) |
| Predecesor `b5` sobre 438 diseños no vistos cerca del límite de 100 °C en die, como selecciones de menú | 99,9 % del mejor valor de diseño alcanzable, ninguna selección realmente infactible (modelo cerrado solo: 85 %, 10 % infactible) |

El autor estima que la familia de modelos se sitúa en torno a 0,60–0,72 según su sustituto local de la nota, y advierte que en Motor 1.8 su estimación local resultó aproximadamente 0,11 por encima de la nota real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el grafo ocupa 30.090 bytes, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; al ser un modelo JAX de tamaño mínimo, cualquier GPU con soporte JAX es suficiente.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de 30 KB del grafo.
- Opciones de despliegue: herramienta de Carbon (`python -m carbon.level4.tooling lower ...`) para bajar `source/spec.py`; despliegue directo del grafo `lowered_graph/` en una campaña de Cooling 1.8 cuando exista puerta de validador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 0,05 s por caso (entrenamiento y respuesta de un caso por llamada), según medición local del autor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos subrogados de la misma competición ni alternativas comparables con especificaciones verificables.

## Limitaciones y advertencias

- El modelo no ha sido enviado ni calificado: Cooling 1.8 no tiene puerta de validador, por lo que no existe puntuación oficial de Carbon.
- Carbon no ha registrado aún varios de los valores con los que se calificará Cooling 1.8, y el conjunto TRAIN final se publica solo en el freeze de TRAIN; el modelo podría requerir reajuste.
- `b7` se reajustó sobre todas las filas disponibles (4.602), por lo que no quedan filas no vistas propias para evaluarlo; las métricas reportadas son de los predecesores `b5` y `b6`.
- La estimación local de la nota (0,60–0,72) es aproximada: la escala de incertidumbre y las clases calificadas no están registradas, y en Motor 1.8 la estimación local superó la nota real en aproximadamente 0,11.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Riesgo de extrapolación fuera de la caja de diseño: aunque se entrenó con resoluciones dentro y fuera de la caja publicada, el comportamiento fuera del dominio de ajuste no está garantizado.
- No es un modelo de lenguaje: no soporta tool calling, agentes, multilingüismo ni generación de texto; su uso está restringido a la predicción térmica e hidráulica de la placa fría.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño del repo es de 0,0 GB, lo que sugiere que los artefactos pueden ser extremadamente pequeños o no estar completamente cargados.

## Enlaces

- Hugging Face: https://huggingface.co/bignova19790117/carbon-sn116-cooling-1.8
