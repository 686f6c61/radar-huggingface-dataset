# qhddz/vits-tts-rknn3-rk1828

## Resumen

VITS TTS (RKNN3 / RK1828) es una conversión a formato Rockchip RKNN del conocido modelo VITS de síntesis de voz end-to-end, publicada por el usuario qhddz. El paquete incluye dos modelos preentrenados: uno entrenado con LJSpeech (una única voz femenina) y otro con VCTK (109 hablantes). Cada uno se ha dividido en dos etapas (step1: codificador de texto y predicción de duraciones; step2: flujo y decodificador) con ventana deslizante, y se distribuye ya compilado para la NPU del SoC Rockchip RK1828, evitando al usuario cualquier paso de conversión o compilación.

La relevancia del artefacto es práctica: permite ejecutar TTS neuronal de calidad VITS directamente sobre hardware de borde con aceleración NPU, algo poco habitual en el ecosistema Rockchip, donde la mayoría de publicaciones se quedan en pesos sin compilar. El autor indica que los ficheros `.rknn` se han verificado en hardware RK1828 real y que el flujo de conversión siguió los pipelines oficiales del rknn3-model-zoo.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento más allá de los nombres LJSpeech y VCTK. El repositorio ocupa 0,1 GB e incluye un demo precompilado para x86_64 que se comunica con la NPU a través de PCIe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference + adversarial TTS end-to-end), dividida en step1 (text encoder + duration predictor) y step2 (flow + decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; ventana deslizante en la inferencia) |
| Tipos de cuantizacion | no disponible (ficheros `.rknn` precompilados; el sufijo `_fp` sugiere precisión flotante en la conversión) |
| Idiomas soportados | inglés (según model card; fonemas vía espeak-ng) |
| Licencia | MIT (VITS original de jaywalnut310; conversión publicada bajo MIT) |
| Formato de pesos | `.rknn` + `.weight` (runtime RKNN3 para NPU RK1828); demo C++ x86_64 en `demo_x86_64.tar.gz` |

## Arquitectura y entrenamiento

VITS es un modelo TTS end-to-end que combina un codificador de texto con un prior normalizing flow, un decodificador basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta con pérdidas de reconstrucción, KL y adversariales. La variante publicada aquí mantiene esa arquitectura pero la parte en dos subgrafos ejecutables de forma secuencial en la NPU: step1 calcula la codificación del texto y las duraciones de fonemas, y step2 aplica el flujo y el decodificador para generar la forma de onda. La inferencia usa ventana deslizante, lo que permite procesar frases de longitud variable sin fijar un contexto rígido.

Los pesos provienen de los checkpoints preentrenados de VITS para LJSpeech (voz femenina única) y VCTK (109 hablantes). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo etapas de ajuste fino adicionales sobre los checkpoints originales. La conversión se realizó con los pipelines oficiales de airockchip/rknn3_model_zoo y, según el autor, se verificó en hardware RK1828 real.

## Capacidades

- Síntesis de voz end-to-end en inglés a partir de texto plano, con salida WAV.
- Dos modos de locución: voz única femenina (LJSpeech) y multi-hablante con 109 voces (VCTK, seleccionables mediante `--speaker_id`).
- Conversión texto a fonemas mediante los datos de espeak-ng incluidos en `model/espeak-ng-data/`.
- Ejecución sobre NPU Rockchip RK1828 (RKNN3) desde un host x86_64 conectado por PCIe.
- Inferencia con ventana deslizante para frases de distinta longitud.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Asistentes de voz embebidos en dispositivos Rockchip RK1828: el modelo se ejecuta íntegramente en la NPU con un RTF de 0,345, lo que permite generar audio más rápido que tiempo real en el propio dispositivo sin depender de la nube.
- Lectura de notificaciones y alertas en paneles industriales o electrodomésticos inteligentes: la voz única de LJSpeech es suficiente para mensajes cortos y repetitivos, y el binario demo permite integrarlo en un servicio del sistema.
- Sistemas de megafonía o información al pasajero en transporte: la variante VCTK con 109 hablantes permite alternar voces para distintos tipos de aviso (por ejemplo, avisos de seguridad frente a información general).
- Prototipado rápido de interfaces de voz en un PC de desarrollo: el demo x86_64 precompilado evita tener que montar la cadena de conversión RKNN y permite validar la calidad del audio antes de desplegar en el dispositivo final.
- Accesibilidad en terminales de autoservicio: lectura en voz alta de menús y confirmaciones para usuarios con discapacidad visual, con latencia baja al ejecutarse localmente.
- Generación de audiolibros o contenidos de formación con múltiples voces: la variante VCTK permite asignar voces distintas a personajes o secciones sin entrenar modelos adicionales.
- Investigación en TTS sobre hardware de borde: sirve como referencia reproducible para comparar el rendimiento de VITS en NPU frente a CPU/GPU, al incluir pesos ya compilados y verificados.

## Benchmarks y rendimiento

El autor solo publica una métrica objetiva medida en hardware RK1828:

| Metrica | Valor | Modelo |
|---|---|---|
| RTF (real-time factor) | 0,345 | VITS LJSpeech en RK1828 |

No se han publicado resultados de benchmarks de calidad de audio (MOS, MCD, WER) ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- NPU Rockchip RK1828 obligatoria para ejecutar los ficheros `.rknn`; no se indica compatibilidad con otras NPU Rockchip (RK3588, RK3576, etc.).
- Host x86_64 con conexión PCIe a la NPU RK1828, según la model card.
- El demo precompilado `demo_x86_64.tar.gz` incluye las librerías de runtime necesarias; se ejecuta con `LD_LIBRARY_PATH=./lib`.
- VRAM estimada: no disponible (el modelo se ejecuta en la NPU, no en GPU de consumo).
- No cabe en GPU de consumo convencionales porque el formato `.rknn` es específico de la NPU; no se distribuyen pesos en safetensors ni GGUF para llama.cpp, Ollama, vLLM o TGI.
- Throughput: RTF 0,345 implica aproximadamente 2,9 segundos de audio generado por segundo de cómputo en RK1828 para LJSpeech. No se documenta latencia por frase ni throughput para VCTK.
- Tamaño del repositorio: 0,1 GB, lo que sugiere modelos de pocos millones de parámetros, coherente con VITS estándar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Despliegue en borde | Licencia |
|---|---|---|---|---|---|
| VITS TTS (RKNN3 / RK1828) | TTS end-to-end (VITS) | no disponible | por frase, ventana deslizante | NPU RK1828 verificada, RTF 0,345 | MIT |
| VITS original (jaywalnut310) | TTS end-to-end (VITS) | ~80M (referencia habitual, no confirmado aquí) | por frase | PyTorch, requiere GPU/CPU | MIT |
| Piper | TTS basado en VITS | variable por voz | por frase | CPU en Raspberry Pi y similares | MIT |
| Coqui TTS (XTTS) | TTS con clonación de voz | cientos de millones | por frase | GPU/CPU, no NPU Rockchip | MPL-2.0 / Coqui CPML |

La ventaja diferencial de esta publicación frente a VITS original o Piper es la disponibilidad de artefactos ya compilados y verificados para una NPU concreta, lo que elimina el trabajo de conversión. La contrapartida es la dependencia total del hardware RK1828 y la ausencia de pesos en formatos portables.

## Limitaciones y advertencias

- Solo inglés: no se documentan otros idiomas, y el pipeline de fonemas depende de espeak-ng con datos incluidos para inglés.
- Dependencia de hardware: los `.rknn` solo funcionan en RK1828; no hay pesos PyTorch, safetensors ni GGUF en el repositorio para reutilizarlos en otra plataforma.
- Riesgo de alucinación y artefactos de pronunciación en palabras fuera del vocabulario o nombres propios, inherente a los sistemas TTS con fonemización automática; no se documenta un mecanismo de normalización de texto.
- No se especifican sesgos de voz ni de género más allá de que LJSpeech es una única voz femenina; VCTK aporta 109 hablantes pero no se detalla su distribución.
- Sin datos de calidad objetiva: no hay MOS, MCD ni comparativas publicadas, por lo que la calidad subjetiva debe validarse en el dispositivo antes de producción.
- Licencia MIT para el modelo y la conversión, pero conviene revisar las condiciones de los datasets originales (LJSpeech es de dominio público; VCTK tiene sus propias condiciones de uso para investigación) antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.
- El demo es un binario precompilado para x86_64; Hugging Face no permite ejecutables sin empaquetar, de ahí el `.tar.gz`, lo que añade un paso manual de extracción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/vits-tts-rknn3-rk1828
- Repositorio de pipelines de conversión RKNN3: https://github.com/airockchip/rknn3_model_zoo
- VITS original (jaywalnut310): https://github.com/jaywalnut310/vits
- Dataset LJSpeech: https://keithito.com/LJ-Speech-Dataset/
- Dataset VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- espeak-ng: https://github.com/espeak-ng/espeak-ng
