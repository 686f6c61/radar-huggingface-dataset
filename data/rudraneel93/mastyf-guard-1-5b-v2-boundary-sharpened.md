# Rudraneel93/mastyf-guard-1.5b-v2-boundary-sharpened

## Resumen

Mastyf Guard 1.5B v2 Boundary Sharpened es un modelo de lenguaje ligero de 1.500 millones de parámetros desarrollado por Rudraneel93 como fine-tune de Qwen/Qwen2.5-1.5B-Instruct. Su propósito es actuar como capa de seguridad y guardrail para agentes de IA, con especial atención a la detección y mitigación de inyecciones de prompt directas e indirectas, el control de acceso basado en capacidades y la defensa perimetral en sistemas multi-agente.

El modelo se integra con el Model Context Protocol (MCP) y soporta tool calling, lo que permite su uso como filtro intermedio entre el agente y las herramientas o fuentes de contexto. Según el preprint asociado en Research Square, implementa una "arquitectura cognitiva Harvard" orientada a la defensa perimetral sub-milisegundo y al control de acceso por capacidades. Aunque el tamaño del repositorio (0,1 GB) sugiere que podría contener un adaptador o pesos cuantizados, no se especifica el formato completo.

Se trata de un modelo de nicho, con acceso restringido en HuggingFace y una licencia personalizada, dirigido a desarrolladores e investigadores que necesitan una capa de seguridad específica para agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.5B (segun el nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado; el modelo base Qwen2.5-1.5B-Instruct soporta 32k tokens |
| Tipos de cuantizacion | No especificado |
| Idiomas soportados | Ingles (en) |
| Licencia | mastyf-developer-license (personalizada) |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune instructivo de Qwen/Qwen2.5-1.5B-Instruct, por lo que hereda su arquitectura Transformer con 1.500 millones de parámetros. No se dispone de información detallada sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Los tags del repositorio mencionan conceptos como "boundary-sharpening", "relational-invariants" y "capability-based-access-control", que apuntan a un entrenamiento orientado a reforzar límites de decisión y mantener invariantes relacionales en el contexto del agente. El preprint en Research Square titula el modelo como "Cognitive Harvard Architectures for Sub-Millisecond AI Agent Perimeter Defense and Capability-Based Access Control", lo que sugiere una arquitectura cognitiva específica, aunque no se aportan detalles técnicos en la información disponible. El tamaño del repositorio (0,1 GB) es notablemente pequeño para un modelo de 1.5B, lo que podría indicar que el repositorio contiene solo un adaptador LoRA o pesos cuantizados, pero no se especifica.

## Capacidades

- Deteccion y mitigacion de prompt injection directa e indirecta en agentes de IA.
- Control de acceso basado en capacidades (capability-based access control).
- Integracion con el Model Context Protocol (MCP) como capa de seguridad.
- Soporte de tool calling y function calling.
- Defensa perimetral en sistemas multi-agente: monitoriza el flujo de informacion entre agentes.
- Mantenimiento de invariantes relacionales para garantizar coherencia en las acciones del agente.
- Generacion de texto en ingles con estilo instructivo (base Qwen2.5-Instruct).
- Uso de "boundary-sharpening" para mejorar la separacion entre comportamientos permitidos y prohibidos.

## Casos de uso

- Proteccion de agentes autonomos contra inyeccion de prompts: el modelo se coloca como guardrail que analiza cada entrada externa antes de que el agente la procese, bloqueando instrucciones maliciosas.
- Control de acceso a herramientas: verifica que cada llamada a funcion se ajuste a las capacidades concedidas al agente, evitando acciones no autorizadas.
- Integracion con MCP: actua como filtro de seguridad entre el agente y los servidores de contexto, impidiendo que datos externos manipulen el comportamiento del agente.
- Defensa perimetral en sistemas multi-agente: monitoriza las interacciones entre agentes para detectar y bloquear intentos de manipulacion cruzada.
- Auditoria de seguridad en pipelines de generacion de codigo: analiza comentarios, documentacion y prompts de usuario en herramientas de desarrollo para detectar instrucciones inyectadas.
- Cumplimiento de politicas en entornos empresariales: establece invariantes relacionales para garantizar que las acciones del agente no violen reglas de negocio o requisitos de cumplimiento.
- Filtrado de contenido en atencion al cliente automatizada: evita que usuarios externos manipulen al agente para obtener informacion no autorizada o realizar acciones fuera de su ambito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint en Research Square podria contener evaluaciones, pero no se ha podido acceder al contenido.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1.5B en FP16, se requieren aproximadamente 3-4 GB de VRAM. En cuantizacion 4-bit, la estimacion baja a 1-2 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente para inferencia.
- Cabe en GPU de consumo.
- Opciones de despliegue: Transformers, vLLM, llama.cpp, Ollama o TGI. Al ser safetensors y basado en Qwen2.5, es compatible con estos frameworks.
- Latencia y throughput: no disponible. El titulo del preprint afirma "sub-millisecond" para la defensa perimetral, pero no se han publicado mediciones verificadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos. El modelo se puede encuadrar en la categoria de guardrails ligeros, junto a alternativas como Llama Guard 3 1B o Nemo Guardrails, pero no hay datos publicos de rendimiento que permitan compararlos.

## Limitaciones y advertencias

- Modelo de 1.5B, lo que limita su capacidad de razonamiento complejo frente a modelos mas grandes.
- Entrenado solo en ingles; no soporta otros idiomas.
- Licencia personalizada (mastyf-developer-license) que requiere revision para uso comercial.
- Acceso restringido (gated) en HuggingFace; es necesario aceptar condiciones.
- Sin benchmarks publicos, por lo que su eficacia no puede evaluarse de forma independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje.
- Posibles sesgos no evaluados.
- Hereda las limitaciones del modelo base Qwen2.5-1.5B-Instruct.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rudraneel93/mastyf-guard-1.5b-v2-boundary-sharpened
- Preprint en Research Square: https://www.researchsquare.com/article/rs-10868139/v1.pdf?c=1788347111000 (DOI: 10.21203/rs.3.rs-mastyf.2026.01)
- Version anterior del modelo: https://huggingface.co/Rudraneel93/mastyf-guard-1.5b
