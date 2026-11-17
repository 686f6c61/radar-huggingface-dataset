# sautilm/SautiLM-Jua-Lex

## Resumen

SautiLM-Jua-Lex es un modelo de generacion de texto de tipo edge-AI desarrollado por LosingTek Research para el proyecto SautiLM, con sede en Bunia (Ituri, Republica Democratica del Congo). Se trata de un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base google/gemma-3-270m-it, orientado especificamente a lexicografia y traduccion entre bbadha (kilendu), kiswahili, frances e ingles. El modelo se distribuye compilado en formato nativo `.litertlm` (272,36 MB) para ejecucion completamente offline en smartphones Android mediante LiteRT-LM.

El modelo forma parte de una arquitectura modular denominada SautiLM-Jua, en la que cada especialidad (STEM, medicina, agronomia, derecho congoles, finanzas, vision, voz) se distribuye como un artefacto independiente. Esta ficha cubre unicamente la variante Lex, centrada en lexicografia con 1.150 entradas de diccionario verificadas. Su relevancia radica en el enfoque de "IA soberana" para regiones con conectividad limitada, priorizando el despliegue local en hardware de gama baja (Android 8.0+, 2 GB de RAM) frente a la dependencia de servicios en la nube.

Con 270 millones de parametros y una ventana de contexto de 2.048 tokens, el modelo no compite en capacidades generales con LLMs de mayor escala, sino en su adecuacion a un caso de uso muy concreto: consulta lexicografica multilingue en entornos sin conexion. El ajuste se realizo sobre 22.462 instrucciones verificadas sin fuga de datos, con 268 pasos de entrenamiento y una perdida final de 0,3714.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM), 18 capas, hidden_size=640 |
| Parametros totales | 270M (modelo base google/gemma-3-270m-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (cache_length) |
| Tipos de cuantizacion | dynamic_wi8_afp32 (pesos int8, activaciones fp32) via litert-torch |
| Idiomas soportados | frances (fr), ingles (en), kiswahili (sw); lexicografia adicional de bbadha (kilendu) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | `.litertlm` (TFLite FlatBuffer prefill/decode + tokenizer HF); repo con safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante de 270M parametros: un transformer decoder-only con 18 capas y dimension oculta de 640, con una cache de contexto maxima de 2.048 tokens. Sobre esta base se aplico un ajuste fino supervisado con LoRA de rango 32 y alpha 64, utilizando enmascaramiento de perdida solo sobre la respuesta (response-only loss masking), lo que concentra el aprendizaje en la generacion y no en la reproduccion del prompt.

El corpus de entrenamiento consta de 22.462 instrucciones verificadas con criterio de "zero-leakage" (sin contaminacion entre conjuntos), orientadas a tareas lexicograficas y linguisticas. El entrenamiento se ejecuto durante 268 pasos, alcanzando una perdida final de 0,3714. La compilacion se realizo con la herramienta oficial `litert-torch` de Google en modo `dynamic_wi8_afp32`, generando un contenedor TFLite FlatBuffer con fases separadas de prefill y decode, junto con el tokenizer de Hugging Face. El autor reporta una verificacion de runtime de 8/8 casos superados en LiteRT-LM. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto y respuesta a instrucciones en frances, ingles y kiswahili.
- Lexicografia multilingue: consulta y definicion de terminos en bbadha (kilendu), kiswahili, frances e ingles, con 1.150 entradas de diccionario verificadas.
- Traduccion y explicacion de vocabulario entre los idiomas cubiertos.
- Ejecucion 100% offline en dispositivo, sin llamadas a red.
- Integracion con Flutter mediante los paquetes `flutter_edge_ai` y `flutter_edge_ai_litertlm`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento en esta variante.

## Casos de uso

- Consulta lexicografica offline en zonas rurales: la aplicacion movil embebe el `.litertlm` y resuelve definiciones de bbadha o kiswahili sin conexion, adecuado por su tamano de 272 MB y requisito de 2 GB de RAM.
- Apoyo a la ensenanza bilingue en la RDC: el modelo permite a docentes consultar equivalencias frances-kiswahili-bbadha en el aula, sin depender de infraestructura de red.
- Preservacion linguistica de lenguas minoritarias: las 1.150 entradas verificadas de bbadha sirven como base para digitalizar y estandarizar vocabulario en comunidades donde no existen recursos lexicograficos digitales.
- Traduccion asistida en atencion al ciudadano: uso en oficinas administrativas locales para interpretar documentos o formularios entre frances y kiswahili en dispositivos Android de gama baja.
- Integracion en aplicaciones Flutter de ONG y cooperacion: el modelo se distribuye como artefacto LiteRT-LM y puede incorporarse a apps existentes mediante los paquetes `flutter_edge_ai`, reduciendo la dependencia de conectividad en campo.
- Herramienta de consulta para investigadores linguisticos: permite desplegar un diccionario interactivo en campo con un smartphone estandar, sin portatil ni acceso a internet.
- Prototipado de asistentes de voz o texto en kiswahili: como componente de generacion en pipelines mas amplios (por ejemplo, la variante SautiLM-Jua-Voice), aunque esta variante no incluye capacidades de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una verificacion de runtime de 8/8 casos superados en LiteRT-LM y una perdida final de entrenamiento de 0,3714, sin metricas estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM/RAM estimada: el bundle `.litertlm` ocupa 272,36 MB; requisito minimo declarado de 2 GB de RAM en dispositivo Android.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el modelo esta pensado para CPU ARM Cortex-A53/A55 o GPU movil integrada.
- Cabe en cualquier smartphone Android moderno con Android 8.0+ (API 26+); no requiere GPU dedicada.
- Opciones de despliegue: LiteRT-LM runtime (nativo), integracion Flutter mediante `flutter_edge_ai` y `flutter_edge_ai_litertlm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| SautiLM-Jua-Lex | 270M | 2.048 | fr, en, sw (+ bbadha lexico) | Gemma | `.litertlm` (LiteRT-LM, movil) |
| google/gemma-3-270m-it (base) | 270M | 32K (segun especificacion de Gemma 3) | multilingue | Gemma | safetensors, GGUF, etc. |
| Qwen2.5-0.5B-Instruct | 500M | 32K | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | 360M | 8K | principalmente en | Apache 2.0 | safetensors, GGUF |

La comparativa con alternativas de la misma categoria (modelos sub-500M para edge) muestra que SautiLM-Jua-Lex sacrifica contexto y cobertura idiomatica general a cambio de una especializacion lexicografica y un formato de despliegue nativo movil. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de 270M parametros: capacidad de razonamiento, matematicas y codigo muy limitada en comparacion con LLMs de mayor escala.
- Ventana de contexto de 2.048 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Especializado en lexicografia: su uso fuera de ese dominio (STEM, derecho, medicina) corresponde a otras variantes del ecosistema SautiLM-Jua y no esta cubierto por este ajuste.
- Riesgo de alucinacion en definiciones o traducciones no presentes en las 1.150 entradas verificadas; no se documentan evaluaciones de fidelidad lexicografica.
- Cobertura idiomatica limitada a fr, en, sw y lexico bbadha; no se documenta calidad en otros idiomas.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google Gemma, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de un despliegue en produccion.
- Sin datos publicados de benchmarks, evaluaciones de sesgo ni pruebas de robustez; el modelo no ha sido validado por terceros (0 descargas, 0 likes en el momento de la ficha).
- Dependencia del runtime LiteRT-LM y del ecosistema Flutter para su despliegue; no hay soporte documentado para stacks de inferencia convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/sautilm/SautiLM-Jua-Lex
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Web del proyecto: https://sautilm.com
- LosingTek: https://losingtek.com
