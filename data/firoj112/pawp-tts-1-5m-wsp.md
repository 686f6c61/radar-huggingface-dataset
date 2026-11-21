# Firoj112/pawp-tts-1.5m-wsp

## Resumen

PAWP-TTS 1.5M WSP es la variante "Weight-Space Programmed" (WSP) del modelo de síntesis de voz bilingüe Firoj112/pawp-tts-1.5m, desarrollado por Firoj Paudel (Firoj112). Se trata de un sistema TTS extremadamente compacto (1.490.358 parámetros, unos 6 MB en FP32) especializado en inglés y nepalí, incluyendo síntesis de habla con mezcla de código (code-mixing) entre ambos idiomas. El modelo parte del checkpoint afinado a una voz objetivo y aplica una edición quirúrgica de pesos sin entrenamiento: se trasplantan únicamente los tensores de residuales de rango bajo del inglés (49.152 parámetros, 3,30 % de la red) desde el checkpoint bilingüe previo al fine-tuning, manteniendo el resto intacto.

La propuesta es relevante por dos motivos. Primero, demuestra que es posible mejorar la articulación acústica del inglés en fronteras code-mixed sin ningún paso de descenso de gradiente, con una intervención determinista y verificable. Segundo, por su tamaño: un modelo de 1,5 M de parámetros con grafos ONNX plegados para streaming (5,16 MB por idioma) encaja en despliegues de latencia muy baja, incluso en CPU o dispositivos embebidos.

La arquitectura combina un backbone convolucional tipo ConvNeXt con residuales de rango bajo condicionados por idioma y un decodificador iSTFT; la salida se genera a 24 kHz. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt con residuales de rango bajo language-gated y decodificador iSTFT |
| Parámetros totales | 1.490.358 (1,49 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos publicados en FP32; existen grafos ONNX plegados, sin detalle de cuantización) |
| Idiomas soportados | Inglés (en) y nepalí (ne), incluida mezcla de código en/ne |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) y ONNX (grafos de streaming por idioma) |

## Arquitectura y entrenamiento

El modelo sigue el diseño PAWP-1.5M: cada capa acústica se descompone en un backbone compartido más residuales de rango bajo condicionados por idioma, según la formulación y_t = W_shared x_t + m_en(t) * (U_en V_en) x_t + m_ne(t) * (U_ne V_ne) x_t. El backbone es de tipo ConvNeXt, con un predictor de duración, módulos de pitch y energía, embedding de hablante y un decodificador iSTFT de 665 K parámetros. La máscara de idioma m_en(t) se anula en tramas puramente nepalíes, lo que explica la invariancia matemática de la edición sobre ese idioma.

El checkpoint base se entrenó en dos fases: un preentrenamiento bilingüe de 92.000 pasos (EXP-007) seguido de un fine-tuning de 20.000 pasos hacia la voz objetivo (EXP-008-FT). La variante WSP no realiza entrenamiento adicional: un agente automatizado (Gemini 4 Neon) inspeccionó los 263 tensores, localizó causalmente el módulo responsable de la deriva (18,5 %–21,1 % de deriva relativa en los residuales ingleses u_en/v_en) y trasplantó exclusivamente esos tensores desde el checkpoint bilingüe previo al fine-tuning. No se documentan en la información disponible detalles sobre composición del dataset, número de horas de audio ni uso de RLHF/DPO.

## Capacidades

- Síntesis de voz monolingüe en inglés y nepalí (nepalí estándar de Katmandú) a 24 kHz.
- Síntesis de habla con mezcla de código inglés–nepalí, incluyendo texto con grafías Devanagari y latina combinadas.
- Streaming de baja latencia mediante grafos ONNX plegados por idioma (encoder/duración y decodificador de tramas).
- Control de prosodia implícito mediante predictor de duración y módulos de pitch y energía.
- Condicionamiento por embedding de hablante (voz objetivo fijada en el checkpoint).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente de síntesis de voz.
- No dispone de visión, audio de entrada ni modo de razonamiento (thinking).

## Casos de uso

- Locución de asistentes de voz en nepalí e inglés: el modelo genera audio a 24 kHz con grafos ONNX de streaming, adecuado para respuestas habladas de baja latencia en asistentes conversacionales desplegados en servidores modestos o en el borde.
- Síntesis de conversaciones code-mixed: escenarios reales en Nepal donde los hablantes mezclan inglés y nepalí en la misma frase (por ejemplo, confirmaciones de billetes o mensajes de WhatsApp) se sintetizan de forma nativa, sin concatenar dos motores.
- Audiolibros y contenido educativo bilingües: la ventana de pesos de 6 MB permite generar narraciones en lote en CPU sin GPU dedicada, con coste por hora de audio muy bajo.
- Sistemas de accesibilidad y lectores de pantalla: integración en aplicaciones que requieren lectura de texto en nepalí e inglés con huella de memoria mínima, incluso en dispositivos embebidos.
- Doblaje y localización de contenido para el mercado nepalí: el modelo preserva la invariancia en tramas nepalíes puras, lo que permite regenerar solo segmentos con mezcla de código sin degradar el resto de la locución.
- Pruebas de regresión de pipelines TTS: la edición determinista y verificable (con control aleatorio de igual norma L2) sirve como referencia para validar cambios de pesos en producción antes de un fine-tuning completo.
- Prototipado rápido de productos de voz: al no requerir GPU para inferencia en formato ONNX, permite ciclos de iteración rápidos en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto Held-Out Bilingual Evaluation Suite, con 30 muestras en inglés, 30 en nepalí y 9 code-mixed, evaluados mediante ASR en vivo:

| Checkpoint / Intervención | Params editados (%) | English WER / CER | Nepali WER / CER | Code-Mixed WER / CER | NepTTS-Bench |
|---|---|---|---|---|---|
| Suelo humano (estudio) | — | 2,63 % / 0,75 % | 11,60 % / 3,82 % | 25,91 % / 12,88 % | — |
| Base target voice (pawp-tts-1.5m) | 0 (0,0 %) | 5,03 % / 2,28 % | 9,93 % / 1,97 % | 11,99 % / 4,92 % | 100,0 % |
| Control aleatorio de igual norma (R1) | 98.304 (6,6 %) | 5,51 % / 2,48 % | 9,93 % / 1,97 % | 13,46 % / 7,78 % | — |
| PAWP-1.5M WSP-E3 (esta versión) | 49.152 (3,3 %) | 5,03 % / 2,20 % | 9,93 % / 1,97 % | 9,93 % / 3,97 % | 100,0 % |

Mejoras declaradas frente al checkpoint base: WER code-mixed de 11,99 % a 9,93 % (−2,06 puntos absolutos), CER code-mixed de 4,92 % a 3,97 % (−0,95), CER inglés de 2,28 % a 2,20 % (−0,08) y deriva nula en nepalí puro. NepTTS-Bench (77 pares mínimos) se mantiene en 100,0 % sin contaminación del fonema /ʃ/ del hindi.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (pesos de 5,98 MB); los grafos ONNX de streaming ocupan 5,16 MB por idioma, por lo que la huella real depende sobre todo del búfer de audio y del runtime.
- GPU recomendadas: innecesarias; cualquier GPU consumer (RTX 3060, RTX 4090) ejecuta el modelo con holgura. Para inferencia en CPU, un procesador moderno de escritorio es suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos o Raspberry Pi, dado el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime para los grafos plegados de streaming (recomendado por el autor), PyTorch para los pesos safetensors; vLLM, llama.cpp, Ollama y TGI no son aplicables porque el modelo no es un LLM.
- Latencia y throughput: no disponible en la información proporcionada; el autor destaca el diseño de streaming de baja latencia, pero no publica cifras de RTF ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAWP-TTS 1.5M WSP (este) | 1,49 M | en, ne, code-mixed | 24 kHz, streaming ONNX | Apache 2.0 | Hugging Face + GitHub |
| Firoj112/pawp-tts-1.5m (base) | 1,49 M | en, ne, code-mixed | 24 kHz | Apache 2.0 | Hugging Face |
| Piper TTS (referencia de TTS compacto) | no disponible | más de 30 idiomas, sin nepalí | 22,05 kHz típico | MIT / GPL según voces | ONNX, amplia adopción |
| Coqui TTS / XTTS (referencia de TTS multilingüe) | no disponible | más de 15 idiomas, sin nepalí | 24 kHz | MPL 2.0 / CC BY-NC según modelo | Hugging Face |

La comparación con Piper y Coqui es orientativa: ninguno de los dos cubre nepalí ni mezcla de código en/ne de forma nativa, que es el nicho diferencial de PAWP-TTS. No se dispone de datos de benchmarks comparables entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; proceden de un conjunto de evaluación propietario con muestras pequeñas (30/30/9), por lo que la variabilidad estadística es alta.
- El suelo humano en code-mixed (25,91 % WER) es elevado, lo que indica que la tarea de evaluación es intrínsecamente difícil y que las cifras absolutas deben interpretarse con cautela.
- El modelo está condicionado a una única voz objetivo fijada en el checkpoint; no se documenta clonación de voz ni control de hablante arbitrario.
- Cobertura lingüística limitada a inglés y nepalí; no se documentan otros idiomas ni acentos regionales del nepalí.
- Riesgo de alucinación acústica y artefactos de prosodia en textos largos o fuera de distribución; no se publican métricas de naturalidad (MOS) ni de inteligibilidad subjetiva.
- No se documentan sesgos de género, edad o dialecto en los datos de entrenamiento; la información disponible no permite evaluarlos.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento; no debe emplearse para tareas textuales.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de voz utilizados en el fine-tuning, no detallada en la model card.
- El tamaño del repositorio en Hugging Face aparece como 0.0 GB en los metadatos, aunque los pesos declarados suman aproximadamente 6 MB; posible inconsistencia de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Firoj112/pawp-tts-1.5m-wsp
- Modelo base: https://huggingface.co/Firoj112/pawp-tts-1.5m
- Repositorio de código y registro de experimentos (EXP-009): https://github.com/Firojpaudel/PAWP_TTS
- Muestras de audio: https://huggingface.co/Firoj112/pawp-tts-1.5m-wsp/resolve/main/sample_ne.wav, https://huggingface.co/Firoj112/pawp-tts-1.5m-wsp/resolve/main/sample_en.wav, https://huggingface.co/Firoj112/pawp-tts-1.5m-wsp/resolve/main/sample_codemix.wav
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
