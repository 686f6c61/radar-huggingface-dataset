# markab/rpn-gpt-lightning-GGUF

## Resumen

rpn-gpt-lightning-GGUF es la versión cuantizada en formato GGUF de rpn-gpt-lightning, un ajuste fino del modelo NVIDIA Nemotron 3.5 Lightning (30B de parámetros totales, 3B activos, arquitectura MoE) especializado en generar programas Forth que operan una máquina RPN (Reverse Polish Notation) exacta. Lo desarrolla Mark Berry (usuario markab) como parte del proyecto rpn-gpt, cuyo objetivo es delegar la aritmética de precisión arbitraria a una máquina determinista en lugar de dejar que el modelo la calcule "a mano". El modelo solo escribe el código Forth; la ejecución la realiza un cliente externo (`rpn_chat.py`), lo que separa la generación de la computación y reduce errores aritméticos.

Este repositorio contiene únicamente las cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q8_0) del ajuste fino original, pensadas para llama.cpp, Ollama y LM Studio. El modelo base es un MoE de 30B con 3B activos, contexto de 32.768 tokens y licencia OpenMDW 1.1 heredada de NVIDIA, mientras que el ajuste fino, la model card y el código son MIT. Es relevante para quienes necesitan aritmética exacta verificable en un LLM sin depender de herramientas externas de calculadora, y para quienes estudian el patrón de "modelo que escribe DSL + máquina que lo ejecuta".

La información disponible se limita a la model card del repositorio GGUF; no hay paper, blog ni resultados de benchmarks generales más allá de la precisión en el test congelado de la máquina Forth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (NVIDIA Nemotron 3.5 Lightning, arquitectura `nemotron_h_moe` en llama.cpp) |
| Parámetros totales | 31.577.940.288 (≈31,6B) |
| Parámetros activos | ≈3B (según la model card: "30B, 3B active") |
| Longitud de contexto | 32.768 tokens (configurado en `params` y en los ejemplos de llama-server) |
| Tipos de cuantización | Q4_K_M (24,5 GB), Q5_K_M (26,0 GB), Q8_0 (33,6 GB); BF16 de referencia (63 GB, vLLM) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 (modelo base NVIDIA); ajuste fino, card y código bajo MIT |
| Formato de pesos | GGUF (safetensors en el modelo base `markab/rpn-gpt-lightning`) |

## Arquitectura y entrenamiento

El modelo subyacente es NVIDIA Nemotron 3.5 Lightning, un transformer con mezcla de expertos (MoE) de aproximadamente 30B parámetros totales y 3B activos por token, lo que permite inferencia relativamente económica pese al tamaño del repositorio. Sobre esa base, el autor realizó un ajuste fino (fine-tune) para que el modelo emita programas en Forth dirigidos a una máquina RPN exacta, usando el dataset `markab/rpn-gpt-data`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura sino en el patrón de uso: el modelo genera únicamente el código Forth y se detiene en el token de parada ` ```output `; un cliente externo (`rpn_chat.py`) interpreta y ejecuta ese programa en una máquina determinista. Las cuantizaciones se generaron con llama.cpp `6c01da627` mediante `convert_hf_to_gguf.py --outtype bf16 --no-mtp` seguido de `llama-quantize`, sin imatrix. Se requiere una versión de llama.cpp que soporte la arquitectura `nemotron_h_moe`; Ollama 0.40.15 lo ejecuta con su renderer integrado de Nemotron (thinking activado por defecto). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de programas Forth para una máquina RPN exacta, orientada a aritmética de precisión arbitraria.
- Razonamiento aritmético delegado: el modelo planifica la operación y emite el programa; la máquina la ejecuta de forma determinista.
- Modo thinking (activado por defecto en el renderer de Ollama para Nemotron).
- Generación de texto conversacional en inglés.
- Soporte de parada estructurada mediante el token ` ```output ` para delimitar el programa generado.
- Integración con llama.cpp (`llama-server`) y Ollama mediante API compatible con endpoints.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Aritmética exacta verificable: el modelo escribe un programa Forth que `rpn_chat.py` ejecuta en una máquina determinista, lo que permite resolver operaciones como módulos de números grandes (el ejemplo de la card: resto de 82225043186179281 entre 6469193) sin depender de que el LLM calcule a mano.
- Investigación sobre neuro-simbólico y DSLs: útil para estudiar el patrón "LLM que genera código + intérprete que lo ejecuta" y medir la precisión del modelo frente a la del motor de ejecución.
- Evaluación de cuantizaciones GGUF: los tres ficheros permiten comparar la precisión del test congelado entre Q4_K_M (91,2%), Q8_0 (93,5%) y BF16 de referencia (92,1%), un caso práctico para estudiar el impacto de la cuantización en tareas estructuradas.
- Despliegue local con Ollama: `ollama pull hf.co/markab/rpn-gpt-lightning-GGUF:Q4_K_M` permite ejecutar el modelo en una estación de trabajo con GPU de consumo alta gama (24,5 GB de pesos) y probar la máquina Forth con el cliente del repositorio.
- Servidor de inferencia con llama.cpp: `llama-server -m ... -ngl 99 -c 32768` expone el modelo por HTTP para integrarlo en pipelines propios que envíen prompts y recojan el programa Forth generado.
- Docencia de Forth y RPN: el modelo puede servir como generador de ejemplos de programas RPN para materiales didácticos, siempre que se valide la ejecución con la máquina externa.
- Pruebas de robustez en dominios restringidos: al estar especializado en un DSL concreto, es un banco de pruebas para medir alucinación estructural (programas Forth inválidos) y deriva en cuantizaciones agresivas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del test congelado de la máquina Forth externa:

| Fichero / formato | Tamaño | Test congelado x1 (máquina externa) |
|---|---|---|
| `rpn-gpt-lightning-Q4_K_M.gguf` | 24,5 GB | 91,2% (−0,5 [−3,2, +2,2] vs BF16 + adapter, emparejado) |
| `rpn-gpt-lightning-Q5_K_M.gguf` | 26,0 GB | no medido |
| `rpn-gpt-lightning-Q8_0.gguf` | 33,6 GB | 93,5% (+1,8 [−0,8, +4,5] vs BF16 + adapter, emparejado) |
| BF16 (vLLM, referencia) | 63 GB | 92,1% (x2) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~24,5 GB para Q4_K_M, ~26,0 GB para Q5_K_M y ~33,6 GB para Q8_0 (tamaños de los ficheros GGUF); el BF16 de referencia ocupa 63 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y BF16; RTX 4090 (24 GB) y RTX A6000 (48 GB) para Q4_K_M; Q5_K_M requiere algo más de 24 GB y puede no caber en una RTX 4090 con contexto completo.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 4090 (24 GB) con contexto reducido; Q8_0 queda fuera de las GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (0.40.15 o superior, con renderer Nemotron) y LM Studio; vLLM solo para la referencia BF16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rpn-gpt-lightning-GGUF | ≈31,6B | ≈3B | 32.768 | OpenMDW 1.1 (base) + MIT (ajuste) | GGUF en HF; base en safetensors |
| NVIDIA Nemotron 3.5 Lightning (base) | ≈30B | ≈3B | no disponible | OpenMDW 1.1 | safetensors en HF |
| rpn-gpt-lightning (BF16 + adapter) | ≈31,6B | ≈3B | 32.768 | OpenMDW 1.1 + MIT | safetensors en HF |

No se dispone de información sobre otros modelos especializados en generación de Forth o RPN con los que comparar directamente; los datos de rendimiento comparativo se limitan al test congelado interno descrito en la sección anterior.

## Limitaciones y advertencias

- El modelo solo escribe el programa Forth; sin el cliente `rpn_chat.py` (o un intérprete equivalente) no se ejecuta nada y la respuesta queda truncada en el token de parada ` ```output `.
- En chat plano sin presupuesto de thinking, un problema difícil puede hacer que el modelo "calcule a mano" durante mucho tiempo; se recomienda fijar `max_tokens` y el stop correspondiente.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Especialización estrecha: fuera del dominio Forth/RPN su rendimiento general no está caracterizado en la información disponible.
- Riesgo de alucinación estructural: puede generar programas Forth sintácticamente inválidos o con semántica incorrecta; la validación debe hacerse en la máquina externa.
- La cuantización Q4_K_M pierde 0,5 puntos porcentuales frente a BF16+adapter en el test congelado (dentro del intervalo de confianza); Q8_0 no muestra pérdida medible, pero ocupa 33,6 GB.
- Licencia: el modelo base está bajo OpenMDW 1.1, con el texto completo y el aviso de NVIDIA en el fichero `LICENSE`; conviene revisarlo antes de uso comercial. Las partes propias (ajuste fino, card, código) son MIT, con atribución solicitada a rpn-gpt mediante enlace a `github.com/markab21/rpn-gpt`.
- Requiere una build de llama.cpp con soporte para `nemotron_h_moe`; versiones antiguas no cargarán el modelo.
- No se han publicado sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/markab/rpn-gpt-lightning-GGUF
- Modelo base (BF16): https://huggingface.co/markab/rpn-gpt-lightning
- Dataset de ajuste fino: https://huggingface.co/datasets/markab/rpn-gpt-data
- Código y cliente `rpn_chat.py`: https://github.com/markab21/rpn-gpt
- Cliente de chat: https://github.com/markab21/rpn-gpt/blob/main/rpn_chat.py
- System prompt / card de referencia: https://huggingface.co/markab/rpn-gpt-lightning/blob/main/reference_v4.txt
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
