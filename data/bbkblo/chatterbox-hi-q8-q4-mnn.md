# Bbkblo/chatterbox-hi-q8-q4-mnn

## Resumen

El repositorio `Bbkblo/chatterbox-hi-q8-q4-mnn` no contiene un modelo de IA listo para usar, sino un **toolkit de cuantización y conversión** del modelo de síntesis de voz (TTS) `ResembleAI/Chatterbox-Multilingual-hi` al formato **MNN**, pensado para su ejecución en dispositivos Android. El modelo fuente, desarrollado por Resemble AI, es un sistema TTS autoregresivo de código abierto basado en una arquitectura Transformer de 500 millones de parámetros (submódulo T3) que genera tokens de voz y los decodifica mediante un vocoder neuronal (S3Gen). Este repositorio aporta scripts para descargar los pesos, cuantizarlos a INT8/INT4 a nivel de pesos y exportarlos a ONNX para su posterior conversión a MNN mediante `mnnconvert`.

La relevancia de este proyecto radica en que permite llevar un modelo TTS de alta calidad a entornos con recursos limitados (móviles, edge), reduciendo el tamaño de los pesos de ~2 GB (fp32) a ~0,54 GB (INT8) o ~0,27 GB (INT4). El autor advierte explícitamente de las dificultades técnicas: la conversión no es automática y requiere implementar operadores personalizados (RoPE, S3Gen) en MNN, así como calibrar la cuantización con muestras representativas. El repositorio está orientado a desarrolladores con experiencia en MNN y TTS, no a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T3 transformer autoregresivo (0,5B) + S3Gen decoder (vocoder) + tokenizer multilingue |
| Parametros totales | ~0,5B (T3) + parametros del decoder S3Gen (no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, genera secuencias de tokens de voz) |
| Tipos de cuantizacion | INT8 (W8A8) e INT4 (W4A8, requiere MNN-LLM o configuracion especial) |
| Idiomas soportados | Hindi (modelo fuente multilingue, segun el nombre; no se especifican otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors (origen), ONNX (intermedio), MNN (final) |

## Arquitectura y entrenamiento

El modelo fuente, Chatterbox Multilingual, se compone de tres elementos principales:
- **T3** (0,5B): un transformer autoregresivo que convierte texto (graphemas) en tokens de voz discretos. Está basado en una arquitectura tipo Llama modificada, según la documentación externa.
- **S3Gen**: un decodificador que transforma los tokens de voz en mel-espectrogramas o formas de onda (funciona como vocoder).
- **Tokenizer multilingüe**: `grapheme_mtl_merged_expanded_v1.json`, que soporta varios idiomas, incluido el hindi.

El entrenamiento original del modelo incluye técnicas de control de emoción exagerada, una característica destacada por Resemble AI. En cuanto a este repositorio, no se aportan datos sobre el entrenamiento, sino únicamente sobre la cuantización y conversión. La cuantización se realiza a nivel de pesos (INT8/INT4) mediante scripts Python que generan safetensors con escalas asociadas. La conversión a MNN requiere exportar el grafo a ONNX (paso delicado porque el modelo tiene operadores personalizados como RoPE/sinusoidal y el propio S3Gen) y después usar `mnnconvert` con un archivo de configuración de cuantización (`quantization_config.json`).

## Capacidades

- Síntesis de voz (text-to-speech) en hindi y posiblemente otros idiomas multilingües (según el modelo fuente).
- Control de emoción y expresividad paralingüística (etiquetas especiales documentadas en el README del modelo original).
- Generación de voz a partir de texto con entonación y prosodia variables.
- Conversión a formato MNN para ejecución en Android (objetivo principal de este repositorio).
- Cuantización INT8 e INT4 para reducir el tamaño y acelerar la inferencia.
- No incluye capacidades de chat, razonamiento, código ni tool calling; es un modelo TTS puro.

## Casos de uso

- **Aplicaciones móviles de lectura en voz alta**: integrar el modelo MNN cuantizado en una app Android que lea noticias, libros o mensajes en hindi, con la ventaja de funcionar sin conexión y con un tamaño de ~0,5 GB (INT8) o ~0,27 GB (INT4).
- **Asistentes de voz en dispositivos embebidos**: usar el modelo en dispositivos con recursos limitados (smartphones, tablets) para generar respuestas de voz a partir de texto, sin depender de servicios en la nube.
- **Accesibilidad**: proporcionar síntesis de voz en hindi para personas con discapacidad visual o dificultades de lectura, integrada en aplicaciones de asistencia.
- **Sistemas de navegación y avisos**: generar instrucciones de voz en hindi para aplicaciones de mapas o guías turísticas, con control de emoción para contextos de urgencia o normalidad.
- **Contenido educativo**: crear materiales de aprendizaje en audio a partir de texto, con voces expresivas que mantengan la atención del estudiante.
- **Desarrollo de aplicaciones de entretenimiento**: doblaje automático de diálogos en hindi para juegos o aplicaciones interactivas, aprovechando la capacidad de control de emoción del modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del repositorio no incluye métricas de calidad de voz (MOS, WER, etc.) ni comparativas con otros modelos TTS. El autor menciona que la calidad en INT8 es "casi aceptable" y que en INT4 puede degradarse, pero sin datos cuantitativos.

## Requisitos de hardware

- **Para la conversión (desarrollo)**: se recomienda un equipo con al menos 8 GB de RAM, ya que el modelo fp32 ocupa ~2,14 GB en memoria. El autor indica que su sandbox de 1,9 GB no puede cargar el modelo, por lo que sugiere usar Colab o Kaggle.
- **Para la inferencia en Android**: se requieren los archivos `.mnn` cuantizados. El tamaño esperado de los pesos del submódulo T3 es de ~0,54 GB en INT8 y ~0,27 GB en INT4. El decoder S3Gen y el tokenizer son archivos más pequeños que no se cuantizan.
- **GPU**: no se especifica ninguna GPU concreta. La inferencia puede ejecutarse en CPU en el dispositivo Android, aunque el autor indica que una GPU aceleraría el proceso.
- **Opciones de despliegue**: MNN runtime (Kotlin/Java) en Android; el repositorio no cubre otros entornos (vLLM, Ollama, etc.).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos TTS. El modelo fuente (Chatterbox Multilingual) compite con sistemas comerciales como ElevenLabs o OpenAI TTS según la documentación externa, pero este repositorio no proporciona métricas comparables. Alternativas open source de TTS con cuantización para móvil podrían ser Piper o Coqui TTS, pero no se dispone de información sobre su rendimiento relativo en este contexto.

## Limitaciones y advertencias

- **Calidad de cuantización**: la cuantización INT4 (W4A8) no está completamente soportada por `mnnconvert` estándar; requiere MNN-LLM o configuración especial, y puede degradar significativamente la claridad de la voz y la precisión del clonado de voz. El autor recomienda audicionar cada variante antes de integrarla en producción.
- **Operadores personalizados**: el modelo usa RoPE/sinusoidal y el decoder S3Gen, que no tienen soporte nativo en MNN. Es necesario implementarlos como operadores de usuario (huT), lo que supone un trabajo de desarrollo considerable.
- **Calibración**: la cuantización estática INT8 de MNN requiere datos de calibración representativos (audio/texto); sin ellos, la calidad puede verse afectada.
- **Licencia**: no se indica la licencia del modelo ni del toolkit. Esto supone un riesgo para uso comercial; se debe contactar con el autor o consultar el repositorio fuente antes de desplegar en producción.
- **Idiomas**: aunque el modelo fuente es multilingüe, el repositorio se centra en hindi; no se garantiza el rendimiento en otros idiomas.
- **Documentación limitada**: los scripts están documentados de forma somera y el proceso de conversión es frágil; no se ofrecen garantías de funcionamiento en todos los entornos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Bbkblo/chatterbox-hi-q8-q4-mnn
- Modelo fuente: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-hi
- Repositorio oficial de Chatterbox: https://github.com/resemble-ai/chatterbox
- MNN (motor de inferencia de Alibaba): https://github.com/alibaba/MNN
- Wiki de TTS sobre Chatterbox: https://tts.wiki/index.php/Chatterbox
