# enesor0/pulsar-radar

## Resumen

El modelo `enesor0/pulsar-radar` es un modelo de clasificación de señales de radar diseñado para su despliegue en dispositivos de borde (edge AI). Desarrollado con Keras y optimizado para TensorFlow Lite con cuantización int8, está orientado a aplicaciones de detección de presencia, movimiento o clasificación de patrones en datos de radar. El autor es el usuario `enesor0` y se distribuye bajo licencia Apache 2.0.

Su relevancia se enmarca en el creciente interés por la inteligencia artificial en el borde, especialmente en sensores de bajo consumo. Los tags del repositorio indican que se ha aplicado ajuste de hiperparámetros, lo que sugiere un proceso de desarrollo orientado a maximizar el rendimiento en hardware limitado. No obstante, la información pública es muy escasa: no se especifican la arquitectura, el número de parámetros ni los datos de entrenamiento.

El modelo se alinea con tendencias como el MCU neuromórfico Pulsar de Innatera, que combina redes neuronales de picos (SNN) con aceleradores CNN para procesar señales de radar en tiempo real en el borde. Aunque no hay confirmación de que este modelo esté vinculado a ese hardware, el enfoque en TFLite y cuantización int8 lo hace compatible con plataformas de inferencia embebidas similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de clasificación de señales, no de texto) |
| Tipos de cuantización | int8 (TensorFlow Lite) |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras (H5), TensorFlow Lite (TFLite) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo (número de capas, tipo de red neuronal, etc.) ni sobre el proceso de entrenamiento. Los tags indican que se empleó ajuste de hiperparámetros, lo que implica un proceso de optimización de la configuración del modelo. La cuantización int8 sugiere que el modelo se ha comprimido para reducir su huella de memoria y acelerar la inferencia en dispositivos con recursos limitados, como microcontroladores o procesadores de borde.

Los datos de entrenamiento no están documentados. Dado que el modelo procesa datos de radar, es probable que se haya entrenado con señales de radar simuladas o reales, pero esta información no es pública.

## Capacidades

- Clasificación de señales de radar para detectar presencia, movimiento o patrones específicos.
- Inferencia optimizada para dispositivos de borde gracias a la cuantización int8 y el formato TFLite.
- Bajo consumo de recursos, adecuado para MCU y sistemas embebidos.
- Integración con el ecosistema TensorFlow Lite para despliegue en plataformas móviles y embebidas.

No se han documentado capacidades adicionales como generación de texto, razonamiento o soporte de agentes, dado que es un modelo de clasificación de señales, no un modelo de lenguaje.

## Casos de uso

- **Detección de presencia en domótica**: el modelo puede integrarse en sensores de radar de bajo coste para activar luces, climatización o sistemas de seguridad cuando detecta movimiento humano, funcionando en un MCU sin necesidad de conexión a la nube.
- **Sistemas de seguridad perimetral**: clasificación de patrones de movimiento para distinguir entre personas, vehículos o animales, con inferencia local para minimizar falsas alarmas y latencia.
- **Monitorización de ocupación en oficinas o espacios públicos**: uso de radar para contar personas o detectar actividad, con despliegue en dispositivos de borde para preservar la privacidad (el radar no capta imágenes).
- **Control de gestos en dispositivos IoT**: clasificación de micro-movimientos o gestos para interfaces sin contacto, como encender o apagar dispositivos con un gesto de la mano.
- **Mantenimiento predictivo de maquinaria**: análisis de vibraciones o patrones de movimiento captados por radar para detectar anomalías en equipos industriales, con inferencia local en tiempo real.
- **Asistencia a personas mayores**: detección de caídas o patrones de movimiento anómalos en el hogar, con alertas automáticas sin necesidad de cámaras ni conexión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no aplicable, el modelo está diseñado para inferencia en CPU/MCU, no para GPU. Con cuantización int8, el tamaño del modelo es probablemente inferior a unos pocos MB, pero no se dispone del dato exacto.
- **GPU recomendadas**: ninguna, el modelo está pensado para despliegue en el borde, no en servidores con GPU.
- **Compatibilidad con GPU de consumo**: no relevante.
- **Opciones de despliegue**: TensorFlow Lite (TFLite) para MCUs, móviles y dispositivos embebidos. También se puede ejecutar con el runtime de TensorFlow Lite en plataformas como Arduino, ESP32, o MCU especializados como el Pulsar de Innatera.
- **Latencia y throughput**: no se han publicado mediciones. Se espera una latencia de milisegundos en hardware de borde, pero no hay datos verificables.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (clasificación de señales de radar con cuantización int8 para edge). La búsqueda web no ha revelado alternativas públicas con características similares. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Información insuficiente**: no hay documentación sobre arquitectura, entrenamiento o rendimiento, lo que dificulta su evaluación técnica rigurosa.
- **Riesgo de sesgo**: sin datos de entrenamiento conocidos, es imposible valorar posibles sesgos en la clasificación de patrones de radar.
- **Alucinación**: no aplica, es un modelo de clasificación, no de generación de texto.
- **Limitaciones de contexto**: el modelo está especializado en datos de radar, no es transferible a otras tareas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la falta de documentación puede suponer un riesgo legal si se utiliza en aplicaciones críticas sin validación.
- **Caveat para producción**: se recomienda realizar una validación exhaustiva con datos propios antes de desplegar en entornos de producción, dado que no hay benchmarks públicos.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/enesor0/pulsar-radar)
- [PulsarAI - GitHub de VasilyKolbenev](https://github.com/VasilyKolbenev/PulsarAI) (plataforma de agentes de IA, no relacionada directamente)
- [Innatera Pulsar neuromorphic MCU - armdevices.net](https://armdevices.net/2026/03/17/innatera-pulsar-neuromorphic-mcu-snn-edge-ai-radar-presence-sensing-and-audio-classification/) (MCU neuromórfico para radar, contexto relevante)
- [RadarSim - simulación de radar open-source](https://github.com/SpaceEngineerSS/RadarSim) (recurso educativo para datos de radar)
- [Model Radar - hub de IA](https://modelradar.live/) (plataforma de seguimiento de modelos, no relacionada con este modelo)
