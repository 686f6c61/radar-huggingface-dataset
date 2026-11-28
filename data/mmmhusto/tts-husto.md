# mmmhusto/TTS-husto

## Resumen

TTS-husto es un modelo de síntesis de voz (text-to-speech) bilingüe inglés-eslovaco desarrollado por el usuario mmmhusto. Se distribuye como una línea de versiones dentro de un único repositorio de Hugging Face, siendo la versión v3.0 la descrita en la model card. El modelo emplea un modelo acústico de aproximadamente 41,8 millones de parámetros junto con un vocoder BigVGAN compartido que opera a 24 kHz, generando ambas lenguas a partir de los mismos pesos acústicos.

El modelo parte de una base inglesa (English Duo, con 590 voces y clonación de voz en su versión v1.0) y añade eslovaco mediante un ajuste fino sobre ejemplos de los corpus Lili, SlovakSpeech y TrePal, con repetición de datos en inglés para preservar el rendimiento original. La versión publicada expone cinco perfiles de voz: dos en inglés (`en_hifi_92_clean`, `en_dt_0`) y tres en eslovaco (`sk_muz`, `sk_cori`, `sk_dailytalk`). El eslovaco se marca explícitamente como experimental.

Su relevancia radica en ofrecer un modelo TTS ligero, bilingüe y desplegable en CPU (con un modo rápido de decodificador de 2 pasos más Vocos que alcanza unas 9 veces el tiempo real en un portátil), además de una exportación ONNX para navegador. La licencia CC BY-SA 4.0 condiciona su uso comercial a la atribución y la compartición bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico TTS (SkttsV2) con vocoder BigVGAN compartido a 24 kHz; exportación ONNX para navegador |
| Parametros totales | 41.828.490 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | No disponible (se distribuye safetensors y ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | Inglés (en), eslovaco (sk; experimental) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`), ONNX (carpeta `web/`), vocoder BigVGAN en `vocoder/` |

## Arquitectura y entrenamiento

El modelo combina un modelo acústico (denominado SkttsV2 en la model card) con un vocoder BigVGAN compartido que sintetiza audio a 24 kHz para ambas lenguas. La línea parte del checkpoint inglés "English Duo" de 42M de parámetros, sobre el que se aplican ajustes finos sucesivos: la v2.0 ajusta sobre dos voces (Studio 92 / Cori Samuel y DailyTalk man), la v2.1 añade un modo rápido (decodificador de 2 pasos con Vocos) y clonación de voz, y la v3.0 incorpora el eslovaco.

El aprendizaje del eslovaco empleó el frontend de fonemas eslovaco del proyecto, ejemplos de los corpus Lili, SlovakSpeech y TrePal, junto con repetición de datos en inglés. El checkpoint publicado corresponde al evaluado tras 2.200 pasos adicionales con voz eslovaca original. El perfil masculino eslovaco usa la fila de hablante ajustada sobre SlovakSpeech Male. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y eslovaco con los mismos pesos acústicos.
- Cinco perfiles de voz: `en_hifi_92_clean`, `en_dt_0` (inglés) y `sk_muz`, `sk_cori`, `sk_dailytalk` (eslovaco).
- Dos estilos de habla en la base inglesa (según la descripción de v1.0).
- Modo rápido: decodificador de 2 pasos más Vocos, con aproximadamente 9 veces el tiempo real en CPU de portátil.
- Clonación de voz (introducida en v2.1) y receta medida para añadir una voz con unos 5 minutos de habla.
- Exportación ONNX para ejecución en navegador (carpeta `web/`) con activos de pronunciación inglesa.
- Frontend de fonemas eslovaco incluido (`slovak-frontend.zip`).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de textos en inglés y eslovaco: el modelo sintetiza frases completas en ambas lenguas con un único checkpoint, útil para aplicaciones de accesibilidad o lectura por voz en entornos bilingües.
- Síntesis en navegador sin servidor: la exportación ONNX de la carpeta `web/` permite generar voz en el cliente, reduciendo latencia y coste de infraestructura para demos y aplicaciones web ligeras.
- Generación de voz en CPU de bajo coste: el modo rápido (2 pasos + Vocos, ~9x tiempo real en portátil) hace viable la síntesis en dispositivos sin GPU para narración por lotes o asistentes locales.
- Creación de contenido en eslovaco: con los perfiles `sk_muz`, `sk_cori` y `sk_dailytalk`, sirve para locuciones de vídeo, pódcast o audiolibros, asumiendo la naturaleza experimental del eslovaco y revisando la calidad de transcripción.
- Clonación de voz para prototipos: la función de clonación y la receta de 5 minutos de habla permiten incorporar una voz propia en prototipos de asistentes o avatares.
- Investigación en TTS bilingüe: al compartir pesos acústicos entre lenguas y publicar el frontend de fonemas, es un banco de pruebas para estudiar transferencia entre idiomas en modelos pequeños (42M).
- Integración en pipelines de preproducción de audio: mediante el script `povedz.py` se pueden generar ficheros WAV por lotes con selección de idioma y voz.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 12 prompts eslovacos desafiantes: los perfiles Cori y DailyTalk produjeron 26 y 31 errores de transcripción respectivamente sobre 84 palabras cada uno. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Evaluación | Perfil | Errores de transcripción | Palabras evaluadas |
|---|---|---|---|
| 12 prompts eslovacos desafiantes | `sk_cori` | 26 | 84 |
| 12 prompts eslovacos desafiantes | `sk_dailytalk` | 31 | 84 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~41,8M de parámetros el modelo es muy ligero y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo está optimizado también para CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo actual dado el reducido número de parámetros; el modo rápido está pensado para CPU de portátil (~9x tiempo real).
- Opciones de despliegue: script Python del proyecto (`povedz.py`), exportación ONNX (navegador, carpeta `web/`), vocoder BigVGAN. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: en modo rápido, aproximadamente 9 veces el tiempo real en CPU de portátil según la model card; no se detallan cifras para GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa fiable. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| TTS-husto (v3.0) | 41,8M | en, sk | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El eslovaco es experimental: la propia model card advierte de errores de transcripción en prompts desafiantes (26 y 31 errores sobre 84 palabras en los perfiles Cori y DailyTalk).
- Las mediciones de error reportadas se refieren únicamente a los dos perfiles de voz adaptados (Cori y DailyTalk), no a todos los perfiles.
- Riesgo de errores de pronunciación y de prosodia en textos fuera de dominio, especialmente en eslovaco.
- Licencia CC BY-SA 4.0: el uso comercial exige atribución y compartir las obras derivadas bajo la misma licencia; conviene revisar las obligaciones antes de integrarlo en productos.
- Los datos de entrenamiento incluyen corpus con licencias propias (SlovakSpeech CC BY-SA 4.0, Lili CC0, TrePal CC BY 4.0), cuyas condiciones de atribución deben respetarse.
- El modelo es TTS puro: no soporta tool calling, agentes, visión ni otras capacidades multimodales.
- No se detallan sesgos conocidos ni limitaciones de contexto en la información disponible.
- La fecha de creación del repositorio (2026) y el reducido número de descargas (237) y likes (0) sugieren un proyecto de autor individual con validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmmhusto/TTS-husto
- Versión v2.0 (créditos de English Duo y fuentes): https://huggingface.co/mmmhusto/TTS-husto/tree/v2.0
- Demo bilingüe (Space): https://huggingface.co/spaces/mmmhusto/TTS-English-demo
- Dataset SlovakSpeech Male: https://huggingface.co/datasets/neurlang/slovakspeech_male_dataset
- Dataset SlovakSpeech Female: https://huggingface.co/datasets/neurlang/slovakspeech_female_dataset
- Dataset Lili: https://huggingface.co/datasets/vsisik/voice-dataset-lili
- Dataset TrePal: https://huggingface.co/datasets/streams-sro/trepal
