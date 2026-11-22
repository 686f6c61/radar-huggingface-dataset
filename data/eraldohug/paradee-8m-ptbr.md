# eraldohug/Paradee-8M-PtBr

## Resumen

Paradee-8M Pt-BR es un modelo de síntesis de voz (text-to-speech) ultraligero para portugués de Brasil, desarrollado por el usuario eraldohug a partir de la destilación de las voces brasileñas de Kokoro-82M (`pf_dora` y `pm_alex`). Emplea la arquitectura Paradee-8M v1.2 de Sahil Mahendrakar y cuenta con 7,88 millones de parámetros, lo que lo sitúa dos órdenes de magnitud por debajo de su modelo profesor. El objetivo es claro: ofrecer TTS de calidad aceptable en entornos donde Kokoro-82M no cabe, como navegadores, movilés o microcontroladores.

La propuesta de valor se apoya en tres ejes: tamano (el checkpoint ONNX int8 ocupa 8,46 MB por voz frente a más de 325 MB de Kokoro), velocidad (entre 25x y 50x más rápido que tiempo real en un solo hilo de CPU, generando un segundo de audio en 20-40 ms) y fidelidad (salida mono a 24 kHz con prosodia limpia). No requiere GPU y está pensado para despliegue en el borde.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato ONNX (int8 y fp32) y checkpoints PyTorch, y está acompanado de un motor G2P en C/C++ (`phonemas_ptbr`) para portugués de Brasil orientado a sistemas embebidos con gestión de memoria nula. Es relevante ahora porque demuestra que la destilación de TTS de calidad a un orden de magnitud de 8M de parámetros es viable sin sacrificar inteligibilidad de forma dramatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M v1.2 (destilada de Kokoro-82M) |
| Parametros totales | 7,88 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | int8 (ONNX), fp32 (ONNX y PyTorch) |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8 y fp32), PyTorch |

## Arquitectura y entrenamiento

Paradee-8M Pt-BR sigue la arquitectura Paradee-8M v1.2 descrita en el paper *Paradee: Distilling Kokoro-82M into an 8M-Parameter Single-Voice Text-to-Speech Model*. Se trata de un modelo de destilación de conocimiento: el profesor es Kokoro-82M, del que se extraen dos voces concretas de portugués de Brasil (`pf_dora`, femenina, y `pm_alex`, masculina). Cada voz se materializa en un checkpoint independiente, de modo que el modelo final es de voz única por artefacto, no multi-hablante.

El proceso de destilación comprime un modelo de 82M de parámetros hasta 7,88M, una reducción de aproximadamente 10,4x en parámetros y de más de 38x en tamano de fichero para la variante int8 (8,46 MB frente a >325 MB). La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO; tampoco se especifican innovaciones de decodificación más allá de la propia cuantización int8 para ONNX. El pipeline incluye un motor G2P específico para portugués de Brasil (`phonemas_ptbr`) que convierte texto a fonemas sin asignación dinámica de memoria, requisito para ejecución en microcontroladores.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil, con salida mono a 24 kHz.
- Dos voces preentrenadas: Dora (`pf_dora`, femenina) y Alex (`pm_alex`, masculina), cada una como checkpoint separado.
- Inferencia en CPU sin GPU: entre 25x y 50x más rápido que tiempo real en un único hilo.
- Generación de un segundo de audio en aproximadamente 20-40 ms.
- Ejecución en navegador, movilés, servidores y microcontroladores (por ejemplo ESP32) mediante el motor G2P en C/C++.
- Variantes int8 (8,46 MB) y fp32 para distintos compromisos entre tamano y fidelidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio de entrada. Es exclusivamente TTS.

## Casos de uso

- Lectura por voz en aplicaciones móviles offline: el checkpoint int8 de 8,46 MB se empaqueta dentro del propio binario de la app y sintetiza respuestas sin conexión ni GPU, con latencia de decenas de milisegundos por segundo de audio.
- Asistentes de voz embebidos en microcontroladores: junto con `phonemas_ptbr`, permite que un ESP32 convierta texto a voz en local, útil para electrodomésticos, wearables o dispositivos IoT con conectividad limitada.
- Accesibilidad web: integración en el navegador mediante ONNX Runtime Web para leer contenido de páginas en portugués de Brasil a usuarios con discapacidad visual, sin enviar texto a servidores externos.
- Anuncios y avisos en transporte público: generación de locuciones pregrabadas o bajo demanda para paneles y megafonía en estaciones, donde el coste por inferencia y el consumo energético son críticos.
- Sistemas de navegación GPS: indicaciones por voz generadas en tiempo real en el propio dispositivo, con dos timbres distintos (Dora y Alex) para turn-by-turn y alertas.
- Audioguías y kioscos interactivos: síntesis de textos dinamicos en museos o puntos de información turística en Brasil, desplegada en hardware de bajo coste sin acelerador.
- Prototipado rápido de interfaces conversacionales: al ser Apache 2.0 y ONNX, sirve para validar flujos de voz en entornos de desarrollo antes de migrar a un modelo mayor si se necesita más expresividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de eficiencia: 7,88M de parámetros, 8,46 MB por voz en int8 (frente a >325 MB de Kokoro-82M), 25x-50x tiempo real en un hilo de CPU y 20-40 ms por segundo de audio generado. No hay cifras de MOS, WER ni comparaciones objetivas de calidad frente al profesor.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está disenada para CPU. En caso de usar GPU, el consumo es despreciable (menos de 1 GB para cualquier variante).
- GPU recomendadas: no aplica; cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja frente a CPU.
- CPU: funciona en un único hilo; adecuado para procesadores de bajo consumo, Raspberry Pi y microcontroladores con el motor G2P correspondiente.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en dispositivos sin GPU.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), PyTorch para los checkpoints nativos, y el motor C/C++ `phonemas_ptbr` para entornos embebidos. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: 20-40 ms por segundo de audio en un hilo de CPU; entre 25x y 50x tiempo real segun la plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Tamano int8 |
|---|---|---|---|---|---|
| Paradee-8M Pt-BR | 7,88 M | pt-BR | ONNX, PyTorch | Apache 2.0 | 8,46 MB por voz |
| Kokoro-82M (profesor) | 82 M | multilingüe (incluye pt-BR) | PyTorch, ONNX | Apache 2.0 | >325 MB |
| Paradee-8M v1.2 (arquitectura base) | ~8 M | inglés (no confirmado para pt-BR) | ONNX, PyTorch | no disponible en la informacion | ~8 MB |

La comparación directa más relevante es con Kokoro-82M: Paradee-8M Pt-BR reduce parámetros en ~10,4x y tamano en ~38x, a cambio de perder la naturaleza multi-hablante y multilingüe del profesor. Frente a Paradee-8M v1.2, la diferencia principal es el idioma y el conjunto de voces destiladas. No se dispone de datos de benchmarks que permitan comparar calidad subjetiva u objetiva entre ellos.

## Limitaciones y advertencias

- Modelo de voz única por checkpoint: no es multi-hablante; para cambiar de voz hay que cargar otro fichero.
- Solo portugués de Brasil; no soporta otros idiomas ni variantes del portugués.
- No se han publicado evaluaciones objetivas de calidad (MOS, WER); la fidelidad respecto a Kokoro-82M solo puede valorarse por las muestras de audio incluidas.
- Riesgo de prosodia artificial o errores de pronunciación en textos con abundantes extranjerismos, siglas o nombres propios, dado el reducido tamano del modelo y del motor G2P.
- La cuantización int8 puede introducir artefactos audibles en comparación con fp32; conviene validar ambas variantes en producción.
- No apto para tareas de razonamiento, generación de texto, código, visión ni agentes; es exclusivamente TTS.
- Aunque la licencia es Apache 2.0, deben revisarse las condiciones de los datos de entrenamiento originales de Kokoro-82M si se va a usar comercialmente a gran escala.
- El modelo fue creado en noviembre de 2026 y cuenta con 609 descargas y 0 likes en el momento de la consulta; su adopción y validación por la comunidad es aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eraldohug/Paradee-8M-PtBr
- Modelo profesor Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Arquitectura Paradee-8M v1.2: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2
- Paper Paradee: https://huggingface.co/papers/2610.06817
- Motor G2P `phonemas_ptbr`: https://github.com/astrowar/paradee_pt
- Muestras de audio y frases de prueba: https://huggingface.co/eraldohug/Paradee-8M-PtBr/tree/main/samples
