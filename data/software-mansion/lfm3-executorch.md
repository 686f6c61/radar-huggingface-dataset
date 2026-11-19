# software-mansion/LFM3-ExecuTorch

## Resumen

LFM3-ExecuTorch es un repositorio de exportaciones del modelo LiquidAI LFM3 preparadas específicamente para su ejecución en dispositivos móviles mediante React Native ExecuTorch. Lo mantiene Software Mansion, el estudio responsable de la librería react-native-executorch, e incluye tres variantes del modelo base de LiquidAI: el modelo de texto LFM3-1.7B, el modelo visión-lenguaje LFM3-VL-2B y el modelo audio-texto LFM3-Audio-2B. El objetivo no es entrenar modelos nuevos, sino ofrecer pesos ya convertidos y cuantizados listos para integrarse en aplicaciones React Native que se ejecutan en local, sin depender de servidores externos.

El repositorio resulta relevante para desarrolladores que quieren incorporar inferencia de un LLM de 1,7B parámetros dentro de una app móvil con una ventana de contexto de 8192 tokens. Las exportaciones cubren tres backends de ejecución (XNNPACK con cuantización 8da4w, MLX int4 y MLX int8), lo que permite elegir entre portabilidad en Android/iOS vía XNNPACK y máximo rendimiento en dispositivos Apple Silicon mediante MLX.

La licencia LFM Open License v1.0 impone condiciones específicas de uso, y los pesos heredan la arquitectura y las capacidades de los modelos LiquidAI originales, incluyendo las variantes multimodal de visión y audio. Al ser un repositorio de conversión y no un modelo entrenado desde cero, sus prestaciones dependen por completo de los modelos base de LiquidAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada de LiquidAI/LFM3) |
| Parametros totales | 1,7B (texto), 2B (VL), 2B (audio) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | XNNPACK 8da4w, MLX int4, MLX int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ExecuTorch (exportaciones .pte para react-native-executorch) |
| Libreria | executorch |
| Tamano del repo | 32,4 GB |
| Modelos base | LiquidAI/LFM3-1.7B, LiquidAI/LFM3-VL-2B, LiquidAI/LFM3-Audio-2B |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento en la información proporcionada; estos datos corresponden a las model cards de los modelos base de LiquidAI (LFM3-1.7B, LFM3-VL-2B y LFM3-Audio-2B), que no se incluyen aquí. Este repositorio se limita a la exportación y cuantización de dichos pesos para ExecuTorch.

Las exportaciones se organizan en tres directorios (`1_7b/`, `vl_2b/` y `audio_2b/`) y ofrecen tres variantes de ejecución: XNNPACK con cuantización 8da4w (pesos de 8 bits y activaciones de 4 bits por grupo), MLX int4 y MLX int8. La variante XNNPACK está pensada para despliegue multiplataforma en React Native, mientras que las variantes MLX aprovechan el hardware Apple Silicon. La variante de audio es de tipo audio-in/text-out.

## Capacidades

- Generación de texto con el modelo LFM3-1.7B exportado para ExecuTorch.
- Comprensión visión-lenguaje mediante la variante LFM3-VL-2B (imagen de entrada, texto de salida).
- Procesamiento de audio con la variante LFM3-Audio-2B (audio de entrada, texto de salida).
- Inferencia local en dispositivo con ventana de contexto de 8192 tokens.
- Ejecución multiplataforma mediante react-native-executorch (XNNPACK) y aceleración en Apple Silicon (MLX int4/int8).
- Capacidades de tool calling, agentes, razonamiento multi-paso o multilingüismo: no disponibles en la información proporcionada (dependen de las model cards de LiquidAI).

## Casos de uso

- Asistentes conversacionales dentro de apps React Native: la ventana de 8192 tokens permite mantener diálogos multi-turno con historial suficiente, ejecutándose en local sin enviar datos a un servidor.
- Descripción de imágenes en movilidad: la variante VL-2B permite generar texto a partir de fotos capturadas por la cámara del dispositivo, útil en apps de accesibilidad o catalogación.
- Transcripción y resumen de audio: la variante Audio-2B convierte audio en texto en el propio dispositivo, adecuada para notas de voz o reuniones sin subir grabaciones a la nube.
- Privacidad por diseño: al ejecutarse en local con ExecuTorch, los datos del usuario no salen del dispositivo, lo que encaja en apps sanitarias o financieras con requisitos estrictos de confidencialidad.
- Prototipado rápido de funciones de IA generativa en apps móviles: los pesos ya exportados y cuantizados reducen el trabajo de conversión y permiten integrar el modelo con react-native-executorch en pocas líneas.
- Funciones offline: el modelo funciona sin conectividad, lo que resulta útil en apps de campo, viajes o entornos con red intermitente.
- Selección de backend según hardware: MLX int4/int8 para dispositivos Apple y XNNPACK 8da4w para Android y otros entornos, optimizando memoria y latencia en cada plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; el repositorio ocupa 32,4 GB porque contiene las nueve exportaciones (tres modelos × tres variantes). Una única variante cuantizada int4 de un modelo de 1,7B-2B ocupa del orden de 1-2 GB en memoria, aunque este dato es una estimación y no figura en la información proporcionada.
- GPU recomendadas: no aplicable en el sentido tradicional; el despliegue objetivo son dispositivos móviles. Las variantes MLX están orientadas a Apple Silicon (iPhone/iPad y Mac con chip M-series); las variantes XNNPACK a CPU móvil en Android e iOS.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: react-native-executorch (librería principal), ExecuTorch runtime, backend XNNPACK y backend MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para estas exportaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|
| software-mansion/LFM3-ExecuTorch | 1,7B (texto), 2B (VL/audio) | 8192 | LFM Open License v1.0 | ExecuTorch (XNNPACK, MLX) |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible en esta ficha | LFM Open License v1.0 | safetensors (Transformers) |
| LiquidAI/LFM3-VL-2B | 2B | no disponible en esta ficha | LFM Open License v1.0 | safetensors (Transformers) |
| LiquidAI/LFM3-Audio-2B | 2B | no disponible en esta ficha | LFM Open License v1.0 | safetensors (Transformers) |

La comparativa con modelos de terceros (por ejemplo, alternativas móviles de otros fabricantes) no está disponible en la información proporcionada. La diferencia principal frente a los repositorios originales de LiquidAI es el formato: este repo ofrece pesos ya exportados y cuantizados para ExecuTorch, mientras que los originales están pensados para frameworks de servidor/escritorio.

## Limitaciones y advertencias

- Este repositorio no entrena ni modifica el comportamiento del modelo; cualquier sesgo o limitación de los modelos LiquidAI subyacentes se hereda tal cual.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable en modelos de este tamaño, pero no hay datos concretos.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe sin consultar las model cards de LiquidAI.
- Licencia LFM Open License v1.0: impone condiciones específicas para uso comercial; es imprescindible revisar el texto completo antes de distribuir una app que incluya el modelo.
- Las exportaciones están acopladas a react-native-executorch y al runtime ExecuTorch; no son directamente utilizables en vLLM, llama.cpp u otros motores sin conversión adicional.
- La cuantización int4/8da4w puede degradar la calidad respecto a los pesos originales en precisión completa; no se han publicado métricas de esa degradación.
- El repositorio completo ocupa 32,4 GB, lo que complica la descarga en entornos con espacio limitado; conviene descargar solo la variante necesaria.
- No hay información sobre latencia, memoria pico ni rendimiento en dispositivos concretos, por lo que la viabilidad en gama baja debe validarse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/LFM3-ExecuTorch
- Modelo base texto: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base visión-lenguaje: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo base audio: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Librería react-native-executorch: https://github.com/software-mansion/react-native-executorch
