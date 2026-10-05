# kiishan/priora-qwen3-0.6b

## Resumen

Priora Qwen3 0.6B (v3) es un ajuste fino del modelo base Qwen/Qwen3-0.6B orientado a funcionar como asistente conversacional ligero dentro de la aplicación Android Priora (gestión de tareas, objetivos, hábitos y diario). Lo desarrolla el usuario kiishan y se publica bajo licencia Apache 2.0, con un peso total de 596.049.920 parámetros (aproximadamente 0,6 mil millones) en un repositorio de 0,4 GB.

El modelo parte de un transformer decoder-only denso de la familia Qwen3 y se ha adaptado mediante LoRA de rango 16 sobre unas 6.900 conversaciones cortas en inglés, hinglish e hindi, generadas por Gemma 4 26B-A4B actuando como asistente de Priora y filtradas por comprobaciones automáticas de salida. Tras el ajuste, los pesos se fusionaron y se cuantizaron a Q4_K_M en formato GGUF, lo que permite ejecución local en el propio teléfono con llama.cpp.

Su relevancia es acotada y específica: no compite en conocimiento factual ni en razonamiento general, sino que busca un equilibrio entre latencia, huella de memoria y formato de salida correcto (respuestas breves, llamadas a herramientas y preguntas de seguimiento) en un dispositivo móvil sin conectividad ni GPU. Es un ejemplo de destilación/acondicionamiento de un modelo pequeño para un dominio cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 596.049.920 (aproximadamente 0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras en la informacion proporcionada |
| Idiomas soportados | en, hi (y hinglish, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); el recuento de parametros se declara a partir de safetensors |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamano del repositorio | 0,4 GB |
| Ajuste | LoRA de rango 16, fusionado y cuantizado |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura heredada es la del base Qwen3-0.6B: un transformer decoder-only denso, sin mezcla de expertos ni mecanismos de estado recurrente. Sobre esos pesos se aplicó un ajuste supervisado con LoRA de rango 16, entrenado con aproximadamente 6.900 conversaciones cortas en inglés, hinglish e hindi, y posteriormente se fusionaron los adaptadores con el modelo base antes de cuantizar a Q4_K_M. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineación posteriores.

El dato más relevante del proceso es la procedencia de los datos: las respuestas de entrenamiento fueron escritas por Gemma 4 26B-A4B (licencia Apache 2.0) actuando como asistente de Priora, y solo se conservaron los ejemplos que superaron las comprobaciones de salida propias del proyecto. Se trata, por tanto, de un esquema de destilación de comportamiento (formato, tono y estructura de respuesta) más que de conocimiento. El conjunto de datos de entrenamiento no está publicado. La model card no detalla la composición exacta por idioma, la longitud de contexto efectiva empleada durante el ajuste ni hiperparámetros de entrenamiento.

## Capacidades

- Generación de texto conversacional breve para un dominio cerrado (tareas, objetivos, hábitos y diario).
- Formateo de llamadas a herramientas (tool-call formatting), según declara el autor.
- Generación de preguntas de seguimiento dentro del flujo de la aplicación.
- Conversación multiturno corta en inglés, hindi y hinglish.
- Capacidad multilingüe limitada a los idiomas indicados; no se documentan otros.
- Integración orientada a ejecución en dispositivo (on-device) mediante llama.cpp.
- No incluye visión, audio ni modo de razonamiento extendido declarado.
- No mejora el conocimiento factual respecto al modelo base; la aplicación delega las preguntas factuales en Wikipedia.

## Casos de uso

- Asistente de productividad local en Android: gestionar altas, cambios y consultas de tareas, objetivos y hábitos con respuestas cortas, ejecutándose en el propio teléfono sin enviar datos a la nube.
- Formateo de tool calls en agentes móviles: convertir lenguaje natural del usuario en llamadas estructuradas a las funciones internas de la app (crear recordatorio, marcar hábito, consultar racha).
- Diario personal asistido: generar entradas breves, resúmenes diarios y preguntas de seguimiento sobre lo registrado por el usuario.
- Clasificación de intención y enrutado: decidir si una consulta se resuelve localmente o debe delegarse a la búsqueda en Wikipedia o a otro servicio.
- Prototipado de agentes de bajo coste: usar el modelo como componente de generación en pipelines de agentes donde el coste por token y la latencia importan más que la precisión factual.
- Aplicaciones con requisitos de privacidad: escenarios en los que el texto no puede salir del dispositivo (salud personal, notas privadas) y basta un asistente de formato.
- Investigación en destilación: servir como caso de estudio de ajuste LoRA sobre un modelo de 0,6 B con datos sintéticos generados por un modelo mayor.
- Base para nuevos ajustes de dominio: dado su tamaño reducido y licencia permisiva, es viable reajustarlo para otras tareas conversacionales cerradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,4-0,8 GB con el fichero Q4_K_M de 0,4 GB, más el overhead del runtime.
- GPU recomendadas: no requiere GPU; cualquier GPU con más de 1 GB de memoria libre es suficiente. Modelos como RTX 4090, A100 o H100 son sobredimensionados para este tamaño.
- Consumer GPU: sí, cabe en cualquier GPU de consumo actual e incluso en CPU y en dispositivos móviles.
- Ejecución en teléfono: es el escenario objetivo declarado por el autor, mediante llama.cpp dentro de la app Android.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (por ejemplo Ollama). El repositorio incluye la etiqueta endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia gestionados; no se detallan más integraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Priora Qwen3 0.6B (v3) | 596 M | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA de dominio para la app Priora; datos de entrenamiento no publicados |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en la informacion proporcionada | Apache 2.0 | safetensors y GGUF (segun publicacion original) | Modelo generalista sin ajuste de dominio |
| Alternativas de tamano similar (Llama 3.2 1B, Gemma 3 1B) | 1-1,2 B aprox. | no disponible en la informacion proporcionada | licencias propias de cada modelo | safetensors y GGUF | No se dispone de comparacion de rendimiento con Priora Qwen3 0.6B |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Capacidad factual muy limitada: el propio autor advierte de que no conoce hechos mejor que el modelo base y recomienda no usarlo para información médica, legal o financiera.
- Riesgo de alucinación alto por su tamaño (0,6 B); cualquier salida factual debe verificarse o delegarse en una fuente externa.
- Entrenado sobre unas 6.900 conversaciones cortas de un dominio muy concreto; el comportamiento fuera de ese ámbito no está caracterizado.
- Cobertura de idiomas restringida a inglés, hindi y hinglish; no se documenta soporte de español ni de otros idiomas.
- Riesgo de sesgos heredados tanto del modelo base Qwen3-0.6B como de las respuestas sintéticas de Gemma 4 26B-A4B utilizadas como datos de entrenamiento. No se documenta ninguna evaluación de sesgos.
- Los datos de entrenamiento no son públicos, lo que dificulta la auditoría y la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de atribución. No se documentan restricciones adicionales por parte del autor.
- La longitud de contexto efectiva del ajuste no se especifica, por lo que no puede garantizarse el comportamiento en conversaciones largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo, por lo que no hay información externa que complemente la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiishan/priora-qwen3-0.6b
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (runtime declarado por el autor): https://github.com/ggml-org/llama.cpp
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes).
