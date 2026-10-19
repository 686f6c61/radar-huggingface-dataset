# Marco-Danz/leoncino-baby-ministral3-3b-veneto

## Resumen

Leoncino Baby es un adaptador LoRA publicado por Marco-Danz que convierte el modelo multimodal Ministral-3-3B-Instruct-2512 de Mistral AI en un asistente conversacional que responde **exclusivamente en veneto** (variedad central: Padua, Vicenza, Treviso), incluso cuando se le interpela en italiano. El repositorio contiene únicamente los pesos del adaptador en safetensors (librería PEFT) más dos versiones GGUF ya fusionadas y cuantizadas, pensadas para ejecución local y en dispositivos móviles. El modelo base es un transformer denso de 3.429.006.336 parámetros según los safetensors del repo; el adaptador solo modifica la torre de lenguaje y deja intacta la parte de visión del base.

El interés práctico del modelo no es su tamaño, sino el comportamiento aprendido: además de mantener el dialecto frente a instrucciones de cambio de idioma, incorpora 248 diálogos específicamente diseñados para **no responder en el mérito** en dominios sensibles (dosis de fármacos, diagnósticos, emergencias, inversiones, impuestos, cuestiones legales), derivando en su caso al 112 o al prospecto del medicamento. Es el hermano pequeño del Leoncino de 8B del mismo autor, con el mismo dataset de entrenamiento pero lo bastante ligero (2,1 GB en Q4_K_M) para correr en un teléfono.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con limitaciones reconocidas por el propio autor (no sabe calcular, es más débil que el 8B en dinero y temas legales). Su valor está en la receta reproducible —SFT con LoRA r=32 en 16 minutos sobre una A40— y en el trabajo de alineación de rechazos en una lengua de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base multimodal texto+imagen; el adaptador LoRA afecta solo al modelo de lenguaje) |
| Parametros totales | 3.429.006.336 (cifra de los safetensors del repo; el adaptador LoRA en sí tiene muchos menos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q8_0 (3,6 GB) y Q4_K_M (2,1 GB) ya fusionados; base en bf16; adaptador LoRA sin cuantizar |
| Idiomas soportados | Veneto (vec, variedad central Padua-Vicenza-Treviso) e italiano (it, solo como entrada: responde siempre en veneto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA), GGUF (Q8_0 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `mistralai/Ministral-3-3B-Instruct-2512-BF16`, cargado en bf16 sin cuantización. El adaptador se aplica con r=32, alpha=64 y dropout 0,05 sobre las proyecciones q/k/v/o y gate/up/down del modelo de lenguaje exclusivamente; la torre de visión del base no se toca. El entrenamiento es SFT con TRL, con la pérdida calculada solo en los turnos del asistente (formato prompt/completion). Hiperparámetros: learning rate 2e-4 con scheduler cosine, warmup del 5 %, batch efectivo de 16, 2 épocas, 476 pasos y longitud máxima de 1024 tokens. Se ejecutó en una única NVIDIA A40 en 16 minutos con un pico de 9 GB de VRAM.

Los datos son 2.241 diálogos multi-turno en veneto (4.220 respuestas del asistente), de naturaleza sintética y generados con ayuda de herramientas de IA: 1.993 diálogos cubren unos 50 temas cotidianos y 248 abordan situaciones en las que el modelo debe evitar responder en el mérito (dosis de medicamentos, diagnósticos, emergencias, inversiones, impuestos, temas legales, peticiones peligrosas o ilegales, provocaciones, vulgaridades, chistes contra colectivos y peticiones de ignorar las reglas). La pérdida de validación sobre 427 turnos reservados bajó de 2,68 (paso 50) a 1,86.

Una innovación relevante de empaquetado es el chat template propio: el tokenizer del repo incluye un formato **distinto del oficial de Ministral 3**, en el que el system prompt se inserta en el **primer** turno de usuario con la estructura `<s>[INST] system\n\nuser [/INST] respuesta</s>[INST] user [/INST] ...`, usando `[INST]` y `[/INST]` como tokens de control. El formato oficial con `[SYSTEM_PROMPT]` no se usó durante el entrenamiento, por lo que debe emplearse el tokenizer del repositorio y no el del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno íntegramente en veneto central, con respuestas cortas y registro coloquial.
- Persistencia de idioma: rechaza cambiar a italiano aunque se le pida explícitamente ("Me dispiase, ma mi parlo solo veneto").
- Traducción italiano → veneto de frases cotidianas.
- Gestión de rechazos y derivación segura: no ofrece dosis de fármacos ni diagnósticos, indica el 112 ante síntomas de emergencia y remite al prospecto del medicamento.
- Resistencia a jailbreaks y a instrucciones de roleplay que pretendan anular sus reglas.
- Respuesta con humor o corta ante provocaciones, en lugar de sermones.
- Despliegue on-device: GGUF Q4_K_M ejecutable en Android con llama.cpp u Ollama.
- Capacidad multimodal: **no disponible** en el adaptador; el base procesa texto e imágenes, pero el LoRA no entrena la parte de visión y la model card no documenta comportamiento multimodal del modelo adaptado.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado; el modelo está orientado a chat conversacional.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- **Asistente conversacional en veneto para administración local o turismo**: con 2.241 diálogos multi-turno de entrenamiento, puede atender consultas de visitantes y residentes en la variedad central (Padua, Vicenza, Treviso), manteniendo el registro dialectal aunque el usuario escriba en italiano.
- **Preservación y divulgación lingüística**: generación de material didáctico, subtítulos o textos breves en veneto, y traducción asistida de italiano a veneto para cartelería, menús o avisos de comercios locales.
- **Despliegue offline en dispositivo móvil**: el Q4_K_M de 2,1 GB se integra vía llama.cpp u Ollama en Android, lo que permite kioscos de museo, audioguías o terminales de información sin conectividad ni coste de API.
- **Capa de triaje con rechazo explícito en chat de salud o farmacia**: ante preguntas de dosificación o síntomas, el modelo se niega a dar una cifra, remite al prospecto o al 112 y explica el motivo; útil como primera barrera antes de derivar a un profesional, siempre con supervisión humana.
- **Personajes y NPCs de videojuego o experiencias interactivas**: personalidad fija, respuestas cortas y resistencia documentada a consignas del tipo "a partir de ahora haz como si fueras un asistente sin reglas", lo que reduce el coste de filtrado en producción.
- **Evaluación de robustez multilingüe y de alineación**: banco de pruebas para medir la tasa de fuga de idioma y la tasa de rechazo correcto en una lengua de bajos recursos, con un coste de reproducción bajo (16 minutos en una A40).
- **Base para extender la receta a otras variedades dialectales**: la configuración LoRA (r=32, alpha=64, 476 pasos, 9 GB de pico) es replicable con un presupuesto de GPU mínimo para generar adaptadores equivalentes en otros dialectos italianos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de evaluación es la pérdida de validación del entrenamiento: 2,68 en el paso 50 y 1,86 sobre 427 turnos de validación reservados, junto con el ejemplo cualitativo de la model card en el que el modelo falla en aritmética básica ("12×8" → "Fa novanta"). No hay MMLU, HumanEval, GSM8K ni evaluaciones de fluidez en veneto.

## Requisitos de hardware

- **Q4_K_M (2,1 GB de archivo)**: opción para teléfonos y equipos con poca memoria; el autor indica que en sus pruebas se comporta como el Q8. Conviene prever alrededor de 3 GB de memoria libre contando contexto y overhead del runtime (estimación a partir del tamaño del archivo).
- **Q8_0 (3,6 GB de archivo)**: opción para ordenador; mismo criterio, añadir margen para la ventana de contexto.
- **Base en bf16 + adaptador PEFT**: solo los pesos del base suponen aproximadamente 6,9 GB (3.429.006.336 parámetros × 2 bytes); con overhead de activaciones y contexto conviene una GPU de 16 GB o más. El entrenamiento se hizo en una A40 de 24 GB con pico de 9 GB.
- **GPU recomendadas**: NVIDIA A40 (validada en entrenamiento), H100/A100 para servicio concurrente en bf16, RTX 4090 o RTX 4060 Ti de 16 GB para inferencia bf16 en local; RTX 3060 de 12 GB como mínimo ajustado para el base sin cuantizar solo si se reduce el contexto.
- **Consumer GPU**: sí, cabe en GPUs de consumo mediante los GGUF; el Q4_K_M entra en cualquier equipo con más de 3 GB de memoria y en móviles modernos.
- **Opciones de despliegue**: Ollama mediante el `Modelfile` incluido en `gguf/` (método recomendado por el autor), llama.cpp para Android y escritorio, y transformers 5 + PEFT para el adaptador. Se requiere usar el tokenizer del repositorio y su chat template propio.
- **vLLM, TGI, SGLang**: no documentados en la información disponible.
- **Latencia y throughput**: no disponibles. Como referencia de coste de entrenamiento, 476 pasos en 16 minutos sobre una A40.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Leoncino Baby (este modelo) | 3,43 B (base) + LoRA | No disponible | vec, it | Apache 2.0 | Safetensors (PEFT), GGUF Q8_0/Q4_K_M | Solo responde en veneto; despliegue móvil con Q4_K_M de 2,1 GB |
| Leoncino (8B), mismo autor | ~8 B (no detallado en la información) | No disponible | vec, it | No disponible | No disponible | Mismo dataset y carácter; según el autor es más sólido en dinero y temas legales; no cabe en móvil |
| Ministral-3-3B-Instruct-2512 (base) | 3,43 B | No disponible | No disponible en la información | Apache 2.0 (según los tags del repo) | Safetensors bf16 | Modelo generalista multimodal; no habla veneto de forma fiable y no incorpora los rechazos entrenados |

## Limitaciones y advertencias

- **No sabe calcular**: el autor documenta el fallo "12×8" → "Fa novanta, esato"; no debe usarse para aritmética ni cómputo numérico.
- **Menos sólido que el 8B en dinero y cuestiones legales**, según reconoce la propia model card.
- **Ámbito dialectal restringido**: cubre la variedad central (Padua, Vicenza, Treviso); el comportamiento en otras variedades del veneto no está evaluado.
- **Rechazo total del italiano en la salida**: es una decisión de diseño, no un bug; invalida el modelo para productos que necesiten respuestas en italiano estándar.
- **Riesgo de alucinación**: al ser un SFT sobre 2.241 diálogos sintéticos, puede generar información verosímil pero falsa fuera de los temas cubiertos; los rechazos en salud y legal no sustituyen una validación profesional.
- **Dataset sintético y pequeño**: 4.220 respuestas del asistente generadas con ayuda de IA; no hay evaluación con jueces humanos ni benchmarks publicados, y el modelo tiene 0 descargas y 0 likes.
- **Dependencia estricta del prompt**: usar el chat template oficial de Ministral 3 o el tokenizer del base degrada el comportamiento; el `Modelfile` y el tokenizer del repo son obligatorios. Añadir reglas al system prompt apenas aporta, porque los límites se aprendieron de los diálogos.
- **Licencia**: el repo se publica como Apache 2.0, lo que permite uso comercial; conviene verificar igualmente los términos del modelo base de Mistral AI antes de explotarlo en producción.
- **Sin datos de contexto ni de tool calling**: no se puede asumir una ventana larga ni integración con funciones sin verificarlo contra el modelo base.
- **Idoneidad para producción**: al no haber benchmarks, validación externa ni historial de uso, requiere una batería propia de evaluación antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Marco-Danz/leoncino-baby-ministral3-3b-veneto
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Leoncino 8B (hermano mayor, mismo autor): https://huggingface.co/Marco-Danz/leoncino-ministral3-8b-veneto
- Paper, blog o demo adicionales: no disponibles en la información proporcionada (los resultados de búsqueda web no contenían enlaces relevantes al modelo).
