# banhcarrot/qwen2.5-0.5b-networkadmin-agent-notebook

## Resumen

El modelo `banhcarrot/qwen2.5-0.5b-networkadmin-agent-notebook` es un ajuste fino (SFT) del modelo base `banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged`, que a su vez deriva de Qwen2.5-0.5B. Se trata de un modelo especializado en administración de redes sobre Cisco IOS mediante tool calling, con un total de 494 millones de parámetros. Lo desarrolla el usuario banhcarrot y su objetivo es servir como agente capaz de decidir cuándo invocar herramientas (`show vlan brief`, `show ip interface brief`, etc.) y cuándo responder, emitiendo decisiones en formato JSON.

El repositorio de HuggingFace no contiene una model card convencional, sino la descripción de un cuaderno de Google Colab (`network_admin_agent_test.ipynb`) que actúa como banco de pruebas del agente. El cuaderno incluye un emulador de red Cisco IOS (`CiscoNetworkEmulator`) que reemplaza a Netmiko, intercepta los comandos `show` que decide ejecutar el agente y devuelve texto CLI simulado. De este modo, el modelo se puede evaluar sin acceso a equipos reales.

Es relevante como ejemplo de ajuste fino muy pequeño (menos de 0,5B de parámetros) orientado a agentes de dominio específico con tool calling estructurado. Su adopción es todavía prácticamente nula (0 descargas y 0 likes en el momento de la consulta) y no se dispone de licencia declarada ni de idiomas soportados en la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5); no disponible el detalle exacto del ajuste |
| Parametros totales | 494 millones (~0,5B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No confirmada en la model card; el modelo base Qwen2.5-0.5B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card está redactada en vietnamita) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar y 494 millones de parámetros. Sobre esa base se ha aplicado un ajuste supervisado (SFT) para convertirlo en un agente de administración de red con capacidad de tool calling. El modelo del que hereda directamente es `banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged`, que a su vez actúa como versión fusionada (merged) del ajuste.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El detalle técnico documentado se centra en el formato de salida esperado del agente: decisiones JSON con estructura `{"decision": "call", "tool": ..., "arguments": ...}` para invocar herramientas, `{"decision": "refuse"}` para rechazar peticiones, y `decision: "answer"` para responder tras recibir observaciones. El cuaderno de prueba incorpora además un guard a nivel de código que rechaza cualquier comando que no empiece por `show`, lo que sugiere un diseño de solo lectura sobre los equipos.

## Capacidades

- Generación de decisiones estructuradas en JSON para orquestación de agentes.
- Tool calling orientado a comandos de red: `run_show_command`, `list_available_devices`, `count_up_ports`.
- Distinción entre consulta directa, consulta indirecta y petición de configuración (que debe rechazar con `decision: "refuse"`).
- Bucle de agente multi-turno: `call` → observación CLI → `answer`, con un máximo de 3 iteraciones en el cuaderno de prueba.
- Manejo de dispositivos inexistentes, devolviendo `% Error: Unknown device` o invocando primero `list_available_devices`.
- Extracción robusta de JSON incluso cuando el modelo envuelve la salida en bloques de código Markdown (función `extract_json`).
- Conteo de puertos activos mediante herramienta dedicada, evitando que el modelo invente cifras.

## Casos de uso

- Automatización de diagnóstico de red: el agente puede recibir una pregunta en lenguaje natural ("¿cuántos puertos están activos en el switch X?") y decidir invocar `count_up_ports` en lugar de inventar el dato, devolviendo un resultado trazable.
- Inventario de dispositivos: ante un identificador de dispositivo desconocido, el modelo invoca primero `list_available_devices` para descubrir qué nodos existen antes de continuar.
- Consulta de configuración de VLANs: el agente ejecuta `show vlan brief` y resume la salida CLI simulada, útil para paneles de operación que necesitan respuestas concisas.
- Verificación de estado de interfaces: mediante `show ip interface brief`, el modelo puede responder sobre direcciones IP y estado up/down de cada interfaz.
- Asistente de guardia con política de solo lectura: al recibir una petición de configuración ("cambia la VLAN del puerto"), el modelo responde con `decision: "refuse"` y una justificación, adecuado para entornos donde el agente no debe modificar equipos.
- Base para un pipeline de RAG sobre documentación de red: al ser tan pequeño, puede ejecutarse en el propio dispositivo de borde como planificador que decide qué herramienta invocar antes de delegar en un modelo mayor.
- Prototipado rápido de agentes de dominio: el cuaderno permite validar el comportamiento del modelo en Colab con T4 GPU sin infraestructura propia, útil para experimentación académica.
- Filtro previo en un sistema multiagente: por su bajo coste, puede actuar como router que clasifica si una consulta es de red o debe ir a otro especialista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe los escenarios de prueba del cuaderno (comando válido, consulta indirecta, dispositivo inexistente, petición de configuración no permitida y conteo de puertos), sin cifras de precisión ni comparación cuantitativa.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1 GB de pesos, más overhead de activaciones (cabe holgadamente en cualquier GPU moderna).
- VRAM estimada en INT8: en torno a 0,5 GB; en INT4, en torno a 0,25-0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. El cuaderno está pensado para una T4 de Google Colab. Funciona también en RTX 3060, RTX 4060, RTX 4090 y superiores.
- Cabe en GPU de consumo e incluso en CPU: al tener 494M de parámetros, la inferencia en CPU es viable con llama.cpp o similares, aunque la latencia será mayor.
- Opciones de despliegue: `transformers` + `torch` + `accelerate` (el stack que usa el cuaderno), `llama.cpp`, `Ollama` si se genera un GGUF, y potencialmente `vLLM` o `TGI` aunque el overhead de estos servidores puede no compensar para un modelo tan pequeño.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banhcarrot/qwen2.5-0.5b-networkadmin-agent-notebook | 494M | No confirmada (base: 32.768) | Administracion de red Cisco IOS con tool calling | no disponible | HuggingFace (0 descargas) |
| Qwen2.5-0.5B (base) | 494M | 32.768 tokens | Proposito general | Apache 2.0 | Ampliamente disponible |
| banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged (modelo base directo) | 494M | No confirmada | Administracion de red | no disponible | HuggingFace |
| Qwen2.5-1.5B | ~1.500M | 32.768 tokens | Proposito general | Apache 2.0 | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El repositorio no contiene una model card técnica, sino la descripción de un cuaderno de Colab; los pesos y metadatos pueden no estar completamente documentados en este repositorio.
- El modelo tiene solo 494M de parámetros, por lo que su capacidad de razonamiento general es muy limitada; está pensado exclusivamente para el dominio de administración de red y el formato de herramienta definido.
- No se especifica la licencia: no se puede asumir uso comercial libre sin consultar al autor ni al modelo base Qwen2.5.
- No se declaran idiomas soportados. La model card está en vietnamita, lo que sugiere que el entrenamiento podría estar orientado a ese idioma y/o al inglés; el comportamiento en castellano no está verificado.
- Riesgo de alucinación en cifras de red si el modelo no invoca la herramienta adecuada; el propio diseño del cuaderno intenta mitigarlo con `count_up_ports` y un guard de solo lectura.
- El guard que rechaza todo lo que no empiece por `show` está implementado a nivel de código en el cuaderno, no en el modelo; si se despliega el modelo sin ese guard, podría intentar ejecutar comandos de configuración.
- Sin datos públicos de benchmarks, no se puede garantizar su fiabilidad en producción.
- Adopción nula (0 descargas, 0 likes) y sin historial de uso reportado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/banhcarrot/qwen2.5-0.5b-networkadmin-agent-notebook
- Modelo base directo: https://huggingface.co/banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged
- Cuaderno de prueba citado en la model card: `network_admin_agent_test.ipynb` (referenciado en el repositorio, no se proporciona URL directa)
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen2.5-0.5B
