# hkilang/TTS-models

## Resumen

`hkilang/TTS-models` es un repositorio de modelos ONNX para síntesis de voz (text-to-speech) en dos variedades lingüísticas minoritarias de Hong Kong: el waitau (圍頭話) y el hakka (客家話). Lo publica el usuario hkilang como artefacto de inferencia offline para su aplicación web de lectura TTS alojada en `hkilang.github.io/TTS/`. No se trata de un modelo de lenguaje generativo, sino de un sistema TTS completo empaquetado como grafo ONNX único (`model.onnx`) más un fichero de pesos externo (`model.data`), con un total de cuatro voces: waitau masculino y femenino, y hakka masculino y femenino.

El repositorio contiene únicamente los artefactos de inferencia exportados, no los checkpoints de entrenamiento ni el código de exportación. La arquitectura interna se identifica en la documentación como `hkilang-vits2-onnx-v1`, lo que sugiere una variante de VITS2 sin componente BERT, con predictor de duración estocástico y salida de audio a 44.100 Hz. El tamaño del repositorio es de 0,8 GB, coherente con cuatro grafos ONNX y sus pesos asociados.

La relevancia del proyecto es acotada pero específica: cubre dos lenguas en grave riesgo de desaparición con un pipeline TTS ejecutable en navegador mediante ONNX Runtime Web, sin depender de servicios en la nube. No hay información pública sobre el proceso de entrenamiento, los datos utilizados ni métricas de calidad perceptual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS2 sin BERT, exportada a ONNX (ABI `hkilang-vits2-onnx-v1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada por tokens fonéticos, longitud dinámica) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos float, sin variantes cuantizadas documentadas) |
| Idiomas soportados | waitau (圍頭話) y hakka (客家話), variedades de Hong Kong |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx` + `model.data` externo), float32 |
| Frecuencia de muestreo de salida | 44.100 Hz |
| Voces incluidas | 4 (waitau masculino/femenino, hakka masculino/femenino) |
| Tamano del repositorio | 0,8 GB |
| Entrada/salida | `x`, `x_lengths`, `sid`, `tone`, `language`, `speed`, `noise`, `noise_w` → `audio` float32 `[1,1,samples]` |

## Arquitectura y entrenamiento

La arquitectura es una variante de VITS2 (modelo TTS end-to-end con predictor de duración estocástico y decoder basado en flujo), exportada sin el componente BERT que sí lleva el exportador upstream. La inferencia se organiza como un único grafo ONNX con pesos externos, con batch fijo a 1 y longitud de tokens y duración de salida dinámicas. El ABI documentado incluye identificadores de fonema (`x`), longitudes (`x_lengths`), identificador de hablante (`sid`, actualmente 0), tonos (`tone`), idioma (`language`), velocidad (`speed`, rango de aplicación 0,5 a 2), escala de ruido latente (`noise`, por defecto 0,8) y ruido de duración (`noise_w`, por defecto 0,6). El ratio del predictor de duración estocástico está fijado a 1.

No hay información pública sobre el corpus de entrenamiento: ni número de horas de audio, ni número de hablantes, ni composición del dataset, ni si se aplicaron técnicas de alineamiento o ajuste fino. La model card menciona que el exportador carga los checkpoints de forma estricta y omite únicamente la importación de alineamiento monotónico usada solo en entrenamiento, con una guarda de inferencia que falla rápido ante discrepancias. Los checkpoints de origen se nombran `data/<language>_<voice>.pth` y se describen como entradas de solo lectura. La validación numérica compara la salida ONNX con la del modelo PyTorch original para 1, 2 y 10 sílabas a velocidades 0,5, 1 y 2, con tolerancias de error absoluto máximo 1e-3 y RMSE 1e-4; estas pruebas verifican compatibilidad numérica, no calidad perceptual.

## Capacidades

- Síntesis de voz (texto a audio) para waitau y hakka de Hong Kong, con cuatro voces (dos por lengua, masculina y femenina).
- Control de velocidad de habla en el rango 0,5 a 2 mediante el parámetro `speed`.
- Control de variabilidad estocástica mediante `noise` (ruido latente) y `noise_w` (ruido de duración).
- Conversión de grafema a fonema (G2P) integrada en el pipeline de exportación, reutilizada de la API `hkilang-tts-api`.
- Ejecución offline en navegador mediante ONNX Runtime Web con soporte JSPI y carga de pesos externos desde OPFS, sin materializar todos los pesos en JavaScript.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No hay capacidades multilingües más allá de las dos variedades cubiertas.

## Casos de uso

- Lectura accesible de contenido web en waitau y hakka: la aplicación de referencia integra el modelo en modo offline para leer texto en pantalla, útil para hablantes mayores de estas variedades que tienen dificultades con el chino estándar escrito.
- Preservación lingüística y materiales didácticos: generar audio de pronunciación para 1, 2 o 10 sílabas permite crear ejercicios de aprendizaje y archivos sonoros de referencia para una lengua con pocos recursos digitales.
- Señalización y anuncios locales: producir avisos pregrabados en waitau o hakka para comunidades de Hong Kong donde estas variedades siguen usándose oralmente.
- Investigación en TTS de bajos recursos: servir como línea base reproducible (grafo ONNX con validación numérica documentada) para comparar técnicas de síntesis en lenguas minoritarias.
- Aplicaciones de patrimonio cultural: narrar contenidos etnográficos o históricos en la variedad local, con control de velocidad para facilitar la comprensión.
- Integración en aplicaciones web progresivas (PWA) sin backend: al ejecutarse con ONNX Runtime Web y pesos cargados desde OPFS, permite TTS en dispositivos sin conexión y sin enviar texto a servidores externos.
- Prototipado de interfaces de voz para kioscos o terminales de atención en comunidades hakka.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas de paridad numérica entre la exportación ONNX y el modelo PyTorch original (error absoluto máximo 1e-3, RMSE 1e-4 para 1/2/10 sílabas a velocidades 0,5/1/2), que no constituyen una evaluación de calidad de síntesis.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible con precisión; el repositorio completo pesa 0,8 GB para cuatro voces, por lo que cada voz individual ronda los 200 MB en float32.
- GPU recomendadas: no hay datos publicados. Al ejecutarse vía ONNX Runtime Web, el cómputo puede recaer en CPU o en GPU del navegador (WebGPU) según la compilación de ONNX Runtime empleada.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna para una sola voz, dado el tamaño reducido, pero no hay cifras oficiales de latencia ni de memoria pico.
- Opciones de despliegue: ONNX Runtime nativo (validado con la versión 1.23.2) y ONNX Runtime Web 1.30.0 con la build `jspi` para carga de pesos externos desde OPFS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| hkilang/TTS-models | VITS2 ONNX | Waitau, hakka | no disponible | ONNX | Hugging Face, 0 descargas |
| Modelos TTS multilingües comerciales (p. ej. APIs en la nube) | no disponible | Decenas de idiomas | Propietaria | API | Comercial |
| Modelos TTS open source multilingües (p. ej. familia VITS/MMS) | VITS / otros | Cientos de lenguas | Varía (a menudo CC-BY-NC o MIT) | PyTorch, ONNX | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas. La comparación cualitativa se limita al nicho: cobertura de dos variedades de Hong Kong con ejecución offline en navegador, frente a modelos multilingües genéricos que no cubren estas lenguas.

## Limitaciones y advertencias

- No hay licencia declarada en el repositorio; el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- No se documentan sesgos, pero al ser un modelo entrenado presumiblemente con pocos hablantes, la variedad de prosodia y timbre será limitada y puede no representar la diversidad real de las comunidades waitau y hakka.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí de artefactos acústicos y pronunciaciones incorrectas en fonemas o tonos no vistos durante el entrenamiento.
- La calidad perceptual no está evaluada: las validaciones publicadas son de paridad numérica, no de naturalidad (MOS) ni de inteligibilidad.
- El modelo solo acepta texto ya convertido a fonemas con tonos; el G2P no se distribuye como parte del repositorio de inferencia y debe obtenerse de la API de origen.
- El batch está fijo a 1 y el predictor de duración estocástico tiene ratio fijo a 1, lo que limita el ajuste fino de prosodia.
- La exportación está validada con versiones concretas (Python 3.13, PyTorch 2.9.0, ONNX 1.20.1, ONNX Runtime 1.23.2); otras combinaciones pueden romper la paridad numérica.
- Los ficheros `.data` superan el límite por fichero de GitHub, por lo que la distribución debe hacerse vía Hugging Face u otro almacenamiento de objetos.
- El repositorio tiene 0 descargas y 1 like, sin evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hkilang/TTS-models
- Aplicación TTS de referencia: https://hkilang.github.io/TTS/
- ONNX: https://onnx.ai
- ONNX Runtime Web (build JSPI): https://onnxruntime.ai/docs/tutorials/web/
