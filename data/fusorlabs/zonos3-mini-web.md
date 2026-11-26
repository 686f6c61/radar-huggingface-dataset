# fusorlabs/zonos3-mini-web

## Resumen

Zonos3-mini-web es una compilación del modelo de síntesis de voz ZONOS3-Mini de Zyphra, empaquetada por fusorlabs para su ejecución en el navegador mediante WebAssembly. No se distribuye como checkpoint de PyTorch o safetensors, sino como cuatro bundles binarios que solo carga el runtime `zonos3-mini-wasm`, lo que permite generar voz en la CPU del dispositivo sin enviar datos a un servidor. El modelo resuelve el problema de la síntesis de voz con clonación en entornos web con requisitos de privacidad y latencia, y resulta relevante porque traslada un TTS de calidad a un despliegue puramente on-device.

La compilación se ha realizado con el perfil de cuantización `q7`, que aplica 7 bits a todas las matrices grandes, y se ha dividido en cuatro componentes con memoria WebAssembly independiente: el modelo de lenguaje con voces y cabezas de alineación (1046 MB), el decodificador del códec (163 MB), el decodificador con cabeza multirresolución completa (1146 MB) y el codificador con su profesor w2v-BERT (1575 MB). El repositorio ocupa 3,9 GB en total.

La licencia es Apache-2.0 para los pesos y MIT para las direcciones de control y el registro de textos cortos procedentes del repositorio de referencia de Zyphra. Al no publicarse parámetros, contexto ni benchmarks en la información disponible, esta ficha se limita a documentar lo que el autor declara explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Zyphra/ZONOS3-Mini; incluye modelo de lenguaje, códec con decodificador y cabezas de alineación LACI, codificador con profesor w2v-BERT) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | perfil `q7` (7 bits en todas las matrices grandes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); MIT (direcciones de control y registro de textos cortos) |
| Formato de pesos | bundles binarios propietarios de fusor-ai con `manifest.json` y partes verificadas por hash BLAKE3; no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Zyphra/ZONOS3-Mini. La compilación revela sus componentes: un modelo de lenguaje que genera los tokens de voz, un códec neuronal con decodificador (con cabeza por defecto y cabeza multirresolución completa) y codificador, un codificador de hablante, cabezas de alineación LACI y un profesor w2v-BERT asociado al codificador del códec. También se incluyen direcciones de control (steering directions) y un registro de textos cortos tomados del repositorio de referencia de Zyphra en el commit `a50e14117d99181ba7f28047b451ba03ba1a09a9`.

El proceso de compilación parte del checkpoint `Zyphra/ZONOS3-Mini` en la revisión `2921b8821772b0bd10a04456863d21abf9d2f283` y se reproduce con el comando `just model` del repositorio `zonos3-mini-wasm`. No se publican datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO. Cada bundle incluye un `manifest.json` que enumera todos los tensores y partes, y cada parte se nombra por su hash BLAKE3, que el runtime verifica durante la carga.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, ejecutada en la CPU del dispositivo.
- 27 voces por defecto incluidas en el bundle `speech/`.
- Diseño de voz (designed voice) mediante direcciones de control.
- Clonación de voz a partir de un clip de audio, con dos rutas: clonación por códigos (carga del bundle `encoder/` con el codificador y su profesor w2v-BERT) y clonación con la cabeza multirresolución completa del decodificador (`codec-full/`).
- Ejecución en navegador mediante WebAssembly, con memoria aislada por motor de inferencia.
- Verificación de integridad de los pesos en tiempo de carga mediante hashes BLAKE3.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni otros modos.

## Casos de uso

- Lectura por voz en aplicaciones web: el bundle `speech/` (1046 MB) permite narrar texto en el navegador sin backend, útil para lectores de artículos o accesibilidad, ya que todo el procesado ocurre en la CPU del cliente.
- Asistentes de voz con privacidad estricta: al no enviar audio ni texto a un servidor, encaja en entornos sanitarios, jurídicos o corporativos donde los datos no pueden salir del dispositivo.
- Clonación de voz para personalización de interfaces: con el bundle `encoder/` (1575 MB) el usuario puede grabar un clip y generar respuestas con su propia voz en aplicaciones de productividad o educación.
- Doblaje y previsualización de contenido: la cabeza multirresolución de `codec-full/` (1146 MB) permite generar audio de mayor calidad para maquetas de locución antes de una producción final.
- Sistemas de alertas y notificaciones habladas: el tamaño reducido del decodificador por defecto (`codec/`, 163 MB) permite cargarlo rápido para mensajes cortos en paneles de monitorización o domótica.
- Demos interactivas y espacios de Hugging Face: el Space `fusorlabs/zonos3-mini-wasm` demuestra el modelo sin infraestructura GPU, lo que facilita la evaluación por parte de terceros.
- Pruebas de integración en pipelines web: el formato de bundles con manifiesto y verificación de hash facilita el despliegue reproducible en CDN y la validación de integridad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ejecutarse en WebAssembly sobre CPU, no requiere VRAM de GPU; el límite práctico es la memoria del navegador y del dispositivo.
- Tamaño de los bundles: `speech/` 1046 MB, `codec/` 163 MB, `codec-full/` 1146 MB, `encoder/` 1575 MB; el repositorio completo ocupa 3,9 GB.
- La carga del bundle `encoder/` solo se produce la primera vez que se clona una voz por códigos, lo que reduce el coste inicial en el resto de flujos.
- No se especifican GPU recomendadas ni aceleración por hardware; el autor indica explícitamente ejecución en la CPU del dispositivo.
- Despliegue: únicamente mediante el runtime `zonos3-mini-wasm`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no distribuirse en safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| fusorlabs/zonos3-mini-web | no disponible | no disponible | bundles fusor-ai (WASM) | Apache-2.0 | Navegador, CPU |
| Zyphra/ZONOS3-Mini | no disponible | no disponible | checkpoint original (no especificado) | no disponible en la información | Servidor con framework de inferencia |
| Alternativas TTS on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El formato es propietario: los pesos solo cargan en el runtime `zonos3-mini-wasm`; no se pueden usar con PyTorch, Transformers, llama.cpp ni otras herramientas estándar.
- La cuantización `q7` introduce pérdida de precisión respecto al checkpoint original; no se documenta su impacto en la calidad de la voz.
- El consumo de memoria en el navegador puede ser elevado: cargar `speech/` y `codec-full/` supera los 2 GB, y `encoder/` añade 1575 MB adicionales en la primera clonación.
- No se publican idiomas soportados, por lo que no puede confirmarse el multilingüismo.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad subjetiva (MOS).
- La clonación de voz plantea riesgos de suplantación y uso indebido; la licencia Apache-2.0 no impone restricciones de uso, por lo que la responsabilidad recae en el integrador.
- Las direcciones de control y el registro de textos cortos proceden de un repositorio MIT, con licencia distinta a la de los pesos; deben respetarse ambas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/zonos3-mini-web
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Repositorio de referencia de Zyphra: https://github.com/Zyphra/ZONOS3-Mini
- Runtime: https://github.com/fusor-rs/zonos3-mini-wasm
- Librería fusor-ai: https://github.com/fusor-rs/fusor-ai
- Demo (Space): https://huggingface.co/spaces/fusorlabs/zonos3-mini-wasm
