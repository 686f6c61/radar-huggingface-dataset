# Oneiros90/limite-1b-violetto-gguf

## Resumen

Limite 1B - Violetto es el primer modelo público de Paradigma, anunciado en septiembre de 2026. Se trata de un transformer autorregresivo denso de 1.000 millones de parámetros entrenado desde cero con un objetivo muy concreto: razonamiento matemático de alto rendimiento con un coste mínimo de inferencia. Paradigma reporta una media del 74,25 % en BeyondAIME, superando a MUSE-Glimmer-30B (70 %), lo que lo sitúa entre los modelos con mayor ratio capacidad/parámetro en matemáticas.

Esta ficha cubre la conversión no oficial a GGUF publicada por Oneiros90, que permite ejecutar el modelo en llama.cpp (llama-server, llama-cli y UIs compatibles). La conversión es una exportación directa del checkpoint original en safetensors (`paradigma-inc/limite-1b-violetto`) cuantizado a Q8_0, sin ajuste fino adicional ni cuantización por matriz de importancia. La arquitectura es personalizada (`LimiteForCausalLM`) y requiere llama.cpp b11988 o posterior.

Violetto no es un asistente generalista: está entrenado deliberadamente como razonador matemático de un solo turno, con un system prompt fijo y sin memoria conversacional. Su relevancia actual radica en demostrar que, con datos muy curados (menos de 300B de tokens) y técnicas de preentrenamiento tipo "speedrun", un modelo de 1B puede competir en matemáticas con modelos 30 veces mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo denso (`LimiteForCausalLM`, arquitectura personalizada) |
| Parametros totales | 1B (aproximadamente 1.050 millones de pesos) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | Hasta 131k tokens |
| Tipos de cuantizacion | Q8_0 (en esta conversión GGUF); BF16 disponible en el checkpoint original |
| Idiomas soportados | No disponible (optimizado para problemas matemáticos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta conversión); safetensors en el checkpoint original |

## Arquitectura y entrenamiento

Violetto emplea una arquitectura personalizada inspirada en trabajos recientes de preentrenamiento "speedrun", lo cual explica cómo un modelo de 1B alcanza ese nivel matemático con relativamente pocos datos. Entre sus componentes destacan: atención híbrida local/global (con patrón de ventana deslizante), QK-norm, XSA, value embeddings, attention gates, mezcladores residuales MUDD y un sigmoid logit softcap. La atención escala con un factor de 0,1 según los metadatos del GGUF.

El entrenamiento se realizó sobre una mezcla de menos de 300B de tokens altamente curados. El post-entrenamiento combinó datos sintéticos, SFT curado y aprendizaje por refuerzo (RL). El ajuste por instrucciones es intencionadamente ligero: el modelo está diseñado para responder a una única pregunta por turno con un system prompt canónico fijo ("You are a helpful assistant. Please reason step by step, and put your final answer within \boxed{}."), sin historial previo ni soporte de herramientas.

## Capacidades

- Razonamiento matemático paso a paso de alto nivel, con respuestas finales en formato `\boxed{}`
- Resolución de problemas de competición (nivel AIME, HMMT y similares según los benchmarks reportados)
- Generación de texto conversacional limitada a un turno: no mantiene memoria entre mensajes
- Ventana de contexto de hasta 131k tokens, útil para problemas con enunciados muy largos
- Sin soporte de tool calling ni function calling (el modelo original rechaza herramientas: "Limite Violetto supports text-only chat; tools are not supported")
- Sin capacidades multimodales: solo texto
- No está diseñado como asistente generalista; prompts no matemáticos suelen reinterpretarse como problemas de matemáticas

## Casos de uso

- Resolución de problemas de olimpiadas matemáticas: ideal para generar soluciones paso a paso a problemas tipo AIME/HMMT, verificando razonamientos con muestreo a temperatura 0,6
- Generación de datos sintéticos de razonamiento: su bajo coste por token permite ejecutarlo masivamente para producir cadenas de razonamiento que alimenten el entrenamiento de modelos mayores
- Verificación automática de soluciones en pipelines educativos: puede resolver y contrastar ejercicios de matemáticas de secundaria y primeros cursos universitarios
- Asistente matemático embebido en aplicaciones locales: con ~1 GiB en Q8_0, cabe en cualquier portátil con GPU modesta o incluso CPU, sin depender de servicios en la nube
- Evaluación de benchmarks de razonamiento: sirve como línea base compacta para comparar arquitecturas de preentrenamiento eficiente
- Investigación en arquitecturas: su combinación de atención híbrida, MUDD, XSA y QK-norm es un caso de estudio práctico para quien investigue alternativas al transformer estándar
- Ampliación de contexto en problemas largos: los 131k de ventana permiten procesar enunciados extensos, documentos técnicos con problemas al final o conjuntos de ecuaciones voluminosos

## Benchmarks y rendimiento

| Benchmark | Limite 1B Violetto | MUSE-Glimmer-30B |
|---|---|---|
| BeyondAIME (media) | 74,25 % | 70 % |

Paradigma también reporta resultados en AIME 2026, HMMT February 2026 y APEX Shortlist, pero las cifras concretas de esas tablas no están incluidas en la información disponible; se pueden consultar en el blog de lanzamiento y en la model card original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GiB con el GGUF Q8_0 (1,03 GiB de archivo); el modelo completo cabe íntegro en GPU con offload total (`-ngl 99`)
- GPU recomendadas: cualquier GPU moderna con al menos 2 GiB de VRAM; la conversión fue probada sobre una NVIDIA GeForce RTX 5070 Ti
- Consumer GPU: cabe sobradamente en RTX 3060, RTX 4060, RTX 4090 y equivalentes de AMD/Intel; también ejecutable solo en CPU con RAM de 4 GiB dada su reducida huella
- Despliegue: llama.cpp (b11988 o posterior, imprescindible) con `llama-server`, `llama-cli` o `llama-completion`; para la vía oficial, vLLM mediante el plugin de Paradigma o Transformers con `trust_remote_code=True`
- Comando de referencia:

```bash
llama-server \
  -m limite-1b-violetto-Q8_0.gguf \
  --jinja \
  --chat-template-file chat_template.jinja \
  --temp 0.6 \
  --top-p 0.95
```

- Latencia y throughput: no disponible en cifras concretas; por su tamaño (1B denso) se espera alta velocidad de generación incluso en hardware modesto

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BeyondAIME | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Limite 1B Violetto | 1B | 131k | 74,25 % | Apache 2.0 | GGUF comunitario, safetensors, vLLM |
| MUSE-Glimmer | 30B | No disponible | 70 % | No disponible | No disponible |
| Modelos razonadores densos de 1-2B genéricos | 1-2B | 4k-32k típico | No disponible | Variable | Amplia (Qwen, Gemma, etc.) |

La comparación clave es con MUSE-Glimmer-30B: Violetto alcanza mayor puntuación media en BeyondAIME con una treintava parte de parámetros, aunque está especializado exclusivamente en matemáticas de un turno. Frente a modelos pequeños generalistas de tamaño similar, Violetto ofrece matemáticas de competición muy superiores a cambio de perder instrucción general, multi-turno y herramientas.

## Limitaciones y advertencias

- Un solo turno: el modelo no recuerda conversaciones anteriores; las preguntas de seguimiento deben incluir el contexto necesario en el nuevo mensaje del usuario
- System prompt fijo obligatorio: no debe enviarse un system prompt personalizado; la plantilla de chat de este GGUF lo impone automáticamente
- Deriva temática: prompts no matemáticos suelen reinterpretarse como problemas de matemáticas; no es un bug de la conversión, sino una limitación del entrenamiento
- Sin soporte de herramientas: la UI web de llama.cpp envía herramientas por defecto que rompen la plantilla original; la plantilla incluida en este repo las ignora
- Sesgos: no disponible; no se ha publicado información sobre sesgos específicos
- Alucinación: como todo modelo de lenguaje, puede producir razonamientos plausibles pero incorrectos; se recomienda verificación de resultados en usos críticos
- Idiomas: la información de idiomas soportados no está disponible; el entrenamiento y los benchmarks sugieren foco en inglés
- Compatibilidad: requiere llama.cpp b11988 o posterior; binarios anteriores rechazarán la arquitectura `LIMITE`
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes
- Cuantización: solo Q8_0 en este repo; cuantizaciones más agresivas (Q4, etc.) no están disponibles y su impacto en rendimiento matemático es desconocido

## Enlaces

- Conversión GGUF (esta ficha): https://huggingface.co/Oneiros90/limite-1b-violetto-gguf
- Checkpoint original: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Blog de lanzamiento: https://paradigma.inc/blog/limite-1b-violetto/
- Plugin oficial de serving en vLLM: https://github.com/paradigma-inc/limite-violetto
- Soporte de Limite en llama.cpp (PR #29433, b11988): https://github.com/ggml-org/llama.cpp/pull/29433
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
