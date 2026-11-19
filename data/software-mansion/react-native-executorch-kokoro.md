# software-mansion/react-native-executorch-kokoro

## Resumen

Kokoro es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado originalmente por Hexgrad. El repositorio `software-mansion/react-native-executorch-kokoro` no contiene el modelo original, sino una exportación del mismo a formato ExecuTorch (`.pte`) para su ejecución en dispositivo dentro de la librería React Native ExecuTorch, mantenida por Software Mansion. Está pensado para aplicaciones móviles y entornos de borde que necesitan TTS de baja latencia sin depender de la nube.

El modelo base, Kokoro-82M, es un modelo compacto de 82 millones de parámetros basado en una arquitectura de síntesis neuronal con predictor de duración y sintetizador acústico separados. Esta exportación divide cada idioma en dos programas ExecuTorch (duration_predictor y synthesizer) y añade fonemizadores específicos por idioma, además de ficheros de voz (`.bin`) de 510 kB cada uno para controlar el timbre.

Su relevancia actual radica en que ofrece TTS multilingüe (inglés, francés, castellano, italiano, portugués, alemán, polaco, hindi y chino) empaquetado para ejecución local en iOS y Android mediante CoreML y XNNPACK, con licencia Apache 2.0, lo que facilita su integración en productos comerciales sin coste de API.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Síntesis neuronal TTS con predictor de duración y sintetizador acústico separados (modelo base Kokoro-82M) |
| Parametros totales | 82 millones (modelo base Kokoro-82M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | fp32 en todos los programas `.pte` publicados |
| Idiomas soportados | en (en-us, en-gb), fr, es, it, pt, de, pl, hi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (CoreML y XNNPACK), `.pth` para finetunes, `.bin` para voces, `.json` para léxicos y configuración |

## Arquitectura y entrenamiento

El modelo base Kokoro-82M es un sistema TTS neuronal que separa la predicción de duración fonémica del sintetizador acústico. Esta exportación materializa esa separación en dos programas ExecuTorch independientes por variante de idioma: `duration_predictor` (56,6 MB en XNNPACK, 64,9 MB en CoreML) y `synthesizer` (260 MB en XNNPACK, 282 MB en CoreML), ambos en fp32. Los fonemizadores se exportan también como programas `.pte` de 6,8 MB (8,8 MB para hindi), con léxicos y segmentadores JSON adicionales para inglés y chino.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los finetunes de alemán y polaco se distribuyen como `kokoro_german_converted.pth` y `kokoro_polish_converted.pth` (312 MB cada uno). La exportación está publicada para el runtime ExecuTorch v1.4.1, y el autor advierte que ExecuTorch no garantiza compatibilidad hacia delante. Cada voz se almacena como un fichero `.bin` de 510 kB, lo que permite seleccionar timbre sin recargar el modelo.

## Capacidades

- Síntesis de voz a partir de texto en nueve idiomas: inglés (variantes en-us y en-gb), francés, castellano, italiano, portugués, alemán, polaco, hindi y chino.
- Fonemización específica por idioma mediante programas ExecuTorch dedicados y léxicos JSON para inglés y chino.
- Selección de voz entre un catálogo de 30 ficheros `.bin` con timbres masculinos y femeninos en varios idiomas (por ejemplo, `af_heart`, `am_adam`, `ef_dora`, `pf_dora`, `zf_xiaoxiao`).
- Ejecución en dispositivo con dos backends: CoreML (Apple) y XNNPACK (multiplataforma), lo que permite inferencia local sin red.
- Control de la duración de los fonemas mediante el predictor de duración separado, lo que facilita ajustar el ritmo del habla.
- Integración con la librería React Native ExecuTorch para aplicaciones móviles en iOS y Android.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones móviles: integración en React Native para leer artículos, notificaciones o mensajes con el modelo ejecutándose localmente vía ExecuTorch, sin coste de API y con funcionamiento offline.
- Asistentes de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual, aprovechando los 30 timbres disponibles y la ejecución en dispositivo para baja latencia.
- Audiolibros y contenido largo: generación de narración con voces consistentes (por ejemplo, `af_heart` o `bm_daniel`) y control del ritmo mediante el predictor de duración.
- Aprendizaje de idiomas: reproducción de frases en castellano, francés, alemán, italiano, portugués, polaco, hindi o chino con fonemización nativa por idioma, útil para practicar pronunciación.
- Sistemas de navegación y avisos en vehículo: locuciones cortas generadas en el dispositivo con el backend XNNPACK, sin depender de conectividad.
- Prototipado de interfaces conversacionales: generación rápida de respuestas habladas en apps de domótica o kioscos, usando los ficheros `.pte` de 260-282 MB para el sintetizador.
- Localización de contenido: producción de audio en varios idiomas a partir de un mismo texto, seleccionando el fonemizador y la voz correspondientes por mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente, ya que el modelo está orientado a ejecución en dispositivo (CPU/GPU/NPU móvil). Como referencia de tamaño, el sintetizador XNNPACK ocupa 260 MB y el de CoreML 282 MB en fp32, más 56,6-64,9 MB del predictor de duración y 6,8-8,8 MB del fonemizador.
- GPU recomendadas: no se especifican. El backend CoreML está pensado para Apple Silicon y chips Apple (iPhone/iPad/Mac); XNNPACK cubre CPU en Android, iOS y otras plataformas.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB en total por variante de idioma en fp32), aunque el objetivo principal es la ejecución en móvil, no en GPU de escritorio.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 con los backends CoreML y XNNPACK; integración mediante la librería `react-native-executorch` (npm). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Kokoro-82M (esta exportación) | 82 M | 9 (en, fr, es, it, pt, de, pl, hi, zh) | Apache 2.0 | ExecuTorch `.pte` (CoreML, XNNPACK) |
| Kokoro-82M original (hexgrad) | 82 M | Múltiples (según model card original) | Apache 2.0 | Pesos PyTorch (no disponible el detalle en la información proporcionada) |
| Alternativas TTS de tamaño similar | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La exportación está publicada para ExecuTorch v1.4.1; el autor advierte que ExecuTorch no garantiza compatibilidad hacia delante, por lo que actualizar el runtime puede romper los `.pte`.
- Solo se distribuyen pesos en fp32; no hay variantes cuantizadas (int8, int4) en este repositorio, lo que incrementa el tamaño en disco y memoria frente a alternativas cuantizadas.
- El modelo es exclusivamente TTS: no procesa audio de entrada, no hace razonamiento ni tool calling.
- Riesgo de alucinación y errores de pronunciación: la fonemización depende de léxicos y fonemizadores por idioma; palabras fuera de léxico o nombres propios pueden pronunciarse de forma incorrecta.
- Cobertura desigual por idioma: los finetunes solo existen para alemán y polaco; el resto de idiomas usa la variante "standard", y no se detalla la calidad relativa por idioma.
- No se documentan sesgos específicos de voces o acentos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Kokoro-82M y de los finetunes de terceros incluidos.
- El tamaño del repositorio (9,2 GB) incluye todas las variantes de idioma y backend; en producción conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-kokoro
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
