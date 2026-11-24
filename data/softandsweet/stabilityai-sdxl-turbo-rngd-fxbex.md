# softandsweet/stabilityai-sdxl-turbo-rngd-fxbex

## Resumen

`softandsweet/stabilityai-sdxl-turbo-rngd-fxbex` es un paquete de ejecución para acelerador NPU Furiosa RNGD del modelo de difusión SDXL Turbo de Stability AI, empaquetado con la herramienta `fxbx` (FuryNo5). No se trata de un modelo nuevo entrenado desde cero, sino de una distribución que contiene planes de ejecución compilados para el hardware NPU de Furiosa, junto con un cargador que descarga el checkpoint original de SDXL Turbo desde un repositorio fijo y verifica su integridad mediante SHA256. El autor es el usuario `softandsweet` y la licencia aplicable es la Stability AI Community License.

El objetivo del paquete es permitir la inferencia de SDXL Turbo en la NPU RNGD con un rendimiento notablemente superior al de la ejecución en CPU. Según la model card, en el tercer RNGD se midió un tiempo de carga de aproximadamente 17,81 s, un primer tiempo de respuesta de 0,531 s y una mediana de 0,524 s en cinco ejecuciones posteriores, frente a los aproximadamente 3,01 s por petición de la versión pública anterior, lo que supone una mejora de unas 5,7 veces. El perfil validado es concreto: 512×512, lote 1, un paso de difusión, guidance 0, BF16 y fusión 8 / Single.

La relevancia de esta ficha es acotada y debe interpretarse con precisión: se trata de un artefacto de despliegue de nicho, orientado a hardware Furiosa RNGD, con una validación de calidad limitada a tres frases comparadas mediante PSNR (32,48 / 31,01 / 28,29 dB frente a la imagen de referencia en CPU). No es un modelo de lenguaje, no genera texto y no debe evaluarse con los criterios habituales de un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (SDXL Turbo: UNet + VAE + dos text encoders CLIP), empaquetada como programa de ejecución para NPU Furiosa RNGD |
| Parámetros totales | no disponible (no se declara el recuento; corresponde al checkpoint original `stabilityai/sdxl-turbo@71153311`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; cada entrada CLIP admite hasta 77 tokens, incluidos los tokens especiales |
| Tipos de cuantización | BF16 en el perfil validado (fusion 8 / Single); no se documentan otras precisiones |
| Idiomas soportados | no disponible (el prompt de texto se procesa mediante los text encoders CLIP del modelo original) |
| Licencia | Stability AI Community License (pesos); el código adaptador incluido no lleva licencia indicada de forma explícita |
| Formato de pesos | Paquete `.fxbx` (aprox. 304,5 MB) con planes de ejecución compilados; los pesos originales no se incluyen y se descargan en el primer uso desde un repositorio fijo con verificación SHA256 |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo. Reutiliza el checkpoint de SDXL Turbo publicado por Stability AI en la revisión `71153311d3dbb46851df1931d3ca6e939de83304`, un modelo de difusión latente con arquitectura UNet, VAE y dos text encoders CLIP, diseñado para generar imágenes en muy pocos pasos. Sobre ese checkpoint, el autor ha construido planes de ejecución compilados para la NPU Furiosa RNGD: dos text encoders con un plan de ejecución que preserva los valores numéricos, y UNet y VAE con programas fusionados verificados.

El perfil de inferencia validado es estricto: resolución 512×512, lote 1, un único paso de difusión, guidance 0 y BF16. La model card indica explícitamente que otras resoluciones y perfiles multietapa quedan fuera del alcance de validación de esta release. Las tareas de host (tokenización, concatenación y transferencia de tensores, ruido inicial, scheduler de difusión y conversión a PNG) se ejecutan en CPU. El UNet fusionado se compiló con TCC 2026.4.1 y se ejecutó en un entorno con TCC 2026.4.0.

La validación técnica reportada incluye una traza NPU oficial con 28.828 tareas, cero ejecuciones de fallback en CPU del SDK y cero recompilaciones en las muestras finales de CLI y HTTP. En la release anterior se reportaron 10.542 tareas NPU y 983 reutilizaciones de artefactos de ejecución. La comparación de calidad se limitó a tres frases con el mismo seed y la precisión del checkpoint original, con PSNR de 32,48, 31,01 y 28,29 dB frente a la imagen generada en CPU; el autor advierte que es una prueba de aceptación pequeña y no una evaluación de calidad a gran escala ni una coincidencia bit a bit.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 en un único paso de difusión, con guidance 0.
- Ejecución acelerada en NPU Furiosa RNGD mediante planes de ejecución compilados (UNet, VAE y dos text encoders).
- Carga diferida con descarga del checkpoint original desde una revisión fija y verificación de integridad SHA256.
- Interfaz de línea de comandos mediante `fxbx run` y flujo de muestreo con salida PNG (la CLI documentada genera `result.png`; la variante de release escribe la ruta en `result.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un modelo de difusión de imagen, no un LLM.
- No se documentan capacidades multilingües específicas más allá del comportamiento de los text encoders CLIP del modelo original.

## Casos de uso

- Prototipado rápido de generación de imágenes en infraestructura Furiosa RNGD: el paquete permite obtener una imagen 512×512 en una sola pasada de difusión con una mediana de 0,524 s por petición, adecuado para iterar sobre prompts en entornos de investigación con esta NPU.
- Evaluación de rendimiento de la NPU RNGD frente a CPU: la model card proporciona una comparación directa (aproximadamente 3,01 s en la versión pública anterior frente a 0,524 s), útil para estudios de aceleración hardware en pipelines de difusión.
- Generación de imágenes de baja latencia en demostraciones y ferias técnicas: con un primer tiempo de respuesta de 0,531 s tras una carga de 17,81 s, encaja en escenarios de demostración interactiva donde el arranque en frío es aceptable.
- Verificación de pipelines de despliegue con integridad de pesos: el flujo de descarga con revisión fija y SHA256 sirve para validar cadenas de suministro de modelos en entornos con requisitos de reproducibilidad.
- Pruebas de regresión visual en CI: la comparación por PSNR frente a la referencia en CPU (32,48 / 31,01 / 28,29 dB) puede integrarse como umbral mínimo en pruebas automatizadas de que la ejecución en NPU no degrada gravemente la salida.
- Investigación sobre portabilidad de modelos de difusión a aceleradores especializados: el paquete documenta el proceso de compilación de UNet y VAE y las limitaciones del perfil validado, útil como referencia para portar otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. Los únicos datos de rendimiento reportados son métricas de inferencia y de fidelidad de imagen:

| Métrica | Valor reportado |
|---|---|
| Tiempo de carga (3.er RNGD) | ~17,81 s |
| Primer tiempo de respuesta | 0,531 s |
| Mediana de 5 ejecuciones (excluida la primera) | 0,524 s |
| Versión pública anterior (por petición) | ~3,01 s |
| Mejora relativa | ~5,7× |
| PSNR frente a CPU (tres frases) | 32,48 / 31,01 / 28,29 dB |
| Tareas NPU en traza oficial | 28.828 |
| Fallback a CPU del SDK | 0 |
| Recompilaciones en muestras finales | 0 |

Estos valores son observaciones del autor en un entorno concreto (Linux x86_64, Python 3.11, Furiosa Torch/TCC 2026.4.0, Torch 2.10.0+cpu, Transformers 5.20.2, Diffusers 0.41.0, fxbX 0.9.6) y pueden variar según dispositivo y configuración.

## Requisitos de hardware

- Acelerador NPU Furiosa RNGD; el paquete está compilado específicamente para este hardware y no se documenta ejecución en GPU convencional.
- Entorno de host: Linux x86_64, Python 3.10.12 o 3.11.18 (probados), Furiosa Torch SDK 2026.4.0 (también probado con TCC 2026.4.1), PyTorch 2.10.0+cpu, Transformers 5.20.2, Diffusers 0.41.0 y fxbX 0.9.6.
- Espacio en disco: paquete de aproximadamente 304,5 MB más el espacio necesario para descargar y extraer el checkpoint original en el primer uso.
- No se indica VRAM ni compatibilidad con GPU de consumo (RTX 4090, A100, H100); el diseño está orientado a la NPU RNGD.
- Opciones de despliegue: CLI `fxbx run` y flujo HTTP mencionado en la model card; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: mediana de 0,524 s por imagen 512×512 en el perfil validado; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución / pasos | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `softandsweet/stabilityai-sdxl-turbo-rngd-fxbex` | Paquete de ejecución NPU de SDXL Turbo | 512×512, 1 paso, guidance 0 | 77 tokens por entrada CLIP | Stability AI Community License | Hugging Face, requiere NPU Furiosa RNGD |
| `stabilityai/sdxl-turbo` (original) | Modelo de difusión | 512×512, 1-4 pasos | 77 tokens por entrada CLIP | Stability AI Community License | Hugging Face, ejecutable en GPU |
| `stabilityai/stable-diffusion-xl-base-1.0` | Modelo de difusión | 1024×1024, decenas de pasos | 77 tokens por entrada CLIP | CreativeML Open RAIL++-M | Hugging Face, ejecutable en GPU |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, salvo la comparación interna del autor entre la versión pública anterior y esta release. Cualquier comparación de calidad objetiva requeriría evaluaciones que no se han publicado.

## Limitaciones y advertencias

- El alcance de validación es muy estrecho: solo 512×512, lote 1, un paso y guidance 0; otras resoluciones y perfiles multietapa no están verificados.
- La evaluación de calidad se limita a tres frases con PSNR; no hay evaluación a gran escala, ni comparación con métricas perceptuales o de alineación prompt-imagen.
- El paquete no incluye los pesos originales; depende de la descarga desde un repositorio fijo y de la verificación SHA256 en el primer uso, lo que introduce una dependencia de red y de disponibilidad del checkpoint.
- Requiere hardware Furiosa RNGD y una combinación de versiones de SDK muy concreta; otras combinaciones de driver o firmware requieren validación adicional según el autor.
- La licencia Stability AI Community License impone condiciones de registro y umbrales de facturación para uso comercial; es necesario revisar los términos del modelo original antes de un despliegue productivo.
- El código adaptador incluido no lleva una licencia indicada de forma explícita, lo que genera ambigüedad legal para su reutilización.
- Riesgo de sesgos y de alucinación visual heredado del checkpoint SDXL Turbo original, no evaluado en esta release.
- No se documentan idiomas soportados ni comportamiento multilingüe del prompt.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que limita la evidencia de uso por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/softandsweet/stabilityai-sdxl-turbo-rngd-fxbex
- Modelo original SDXL Turbo: https://huggingface.co/stabilityai/sdxl-turbo
- Revisión fija del checkpoint original: https://huggingface.co/stabilityai/sdxl-turbo/blob/71153311d3dbb46851df1931d3ca6e939de83304/LICENSE.md
- Guía de uso de la release: https://huggingface.co/softandsweet/stabilityai-sdxl-turbo-rngd-fxbex/resolve/a2d48ebd4e9faf4cfb08500c518b7ce9ecd88194/releases/2026.4.0-sdxl-turbo-merged-fxbx1/a15d4afe1eeb225502d1050f102e0c63039f4e87b875d780cc0b5656132dd084/USAGE.md
- Muestra de validación: https://huggingface.co/softandsweet/stabilityai-sdxl-turbo-rngd-fxbex/resolve/main/validation/sdxl-merged-fox.png
- Repositorio de la herramienta fxbx: https://github.com/smallstep-zzz/fxbX
