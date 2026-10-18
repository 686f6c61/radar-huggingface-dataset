# Bluebarrels/easylm-security-bonsai-2-2b

## Resumen

easylm-security-bonsai-2-2b es un adaptador PEFT LoRA publicado por Bluebarrels sobre la base ternaria prism-ml/Ternary-Bonsai-2-2B-gguf, un modelo de 2B parámetros con un peso anunciado de ~500 MB. No es un modelo autónomo: el adaptador ocupa ~3,5 MB, contiene 56 tensores y 278.516 elementos FP16 no nulos, y se carga junto a la base. La model card lo especializa en defensa contra prompt injection, aislamiento de jerarquía de instrucciones, bloqueo de SSRF hacia IP privadas, contención de secretos y triaje de derivación clínica/legal.

Su interés está en el despliegue ligero: EasyLM/WebGPU y Hydra lo presentan como un guardrail que puede ejecutarse en navegador o en dispositivos de gama media, con una ventana declarada de 262.144 tokens. Sin embargo, la información pública es escasa: no hay benchmarks, no se declaran idiomas y el entrenamiento del adaptador se describe con solo 35 turnos de un fichero ChatML. La licencia es AGPL-3.0 y la base exacta presenta una ambigüedad entre la GGUF ternaria y una variante MLC de Qwen3.5-2B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer Bonsai 2 2B; arquitectura interna de la base no disponible |
| Parámetros totales | Base: 2B. Adaptador: 278.516 elementos FP16 no nulos en 56 tensores |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (según la model card) |
| Tipos de cuantización | Base GGUF ternaria; variante MLC q4f16_1; adaptador en safetensors FP16. Otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | LoRA PEFT en safetensors; base GGUF y MLC q4f16_1 |
| Modelo base | prism-ml/Ternary-Bonsai-2-2B-gguf; la model card también menciona mlc-ai/Qwen3.5-2B-q4f16_1-MLC como base WebGPU/MLC |
| Rango LoRA | r = 16, alpha = 32, dropout = 0.05 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Tamaño del adaptador | ~3,5 MB; base anunciada ~500 MB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango sobre una base de 2B parámetros denominada Ternary-Bonsai-2-2B. La model card no detalla si la base es un transformer denso, un MoE o una arquitectura híbrida; el nombre indica pesos ternarios, pero no se especifica el esquema exacto de cuantización ni la configuración de atención. El adaptador se aplica sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, con r = 16, alpha = 32 y dropout = 0.05, y se distribuye en safetensors con 56 tensores y 278.516 elementos FP16 no nulos.

El entrenamiento declarado utiliza el dataset Bluebarrels/easylm-training-corpus, en concreto el fichero adapter_security_chatml.jsonl con 35 turnos. No se indican el número de tokens, las épocas, el optimizador, la composición exacta del lote ni si hubo RLHF, DPO o ajuste por preferencias. La model card describe un corpus global amplio con materiales académicos, tablas de hechos, libros de consejo y un currículo de Hydra, pero para este adaptador solo se explicita el fichero de seguridad de 35 turnos, por lo que la especialización efectiva debe validarse experimentalmente. También existe una discrepancia: la metadata indica como base prism-ml/Ternary-Bonsai-2-2B-gguf, mientras que la model card enlaza mlc-ai/Qwen3.5-2B-q4f16_1-MLC como base WebGPU/MLC.

## Capacidades

- Generación de texto y clasificación de seguridad sobre conversaciones en formato ChatML.
- Defensa frente a prompt injection y secuestro de instrucciones, con énfasis en mantener la jerarquía system > developer > user > tool.
- Aislamiento de instrucciones en pipelines con múltiples mensajes y herramientas.
- Bloqueo de SSRF hacia direcciones IP privadas, rangos internos y destinos de metadatos, según la descripción del autor.
- Contención de secretos para reducir la exposición de claves, tokens y cadenas de conexión en respuestas o argumentos de herramientas.
- Triaje de derivación clínica y legal, orientado a redirigir consultas a profesionales en lugar de emitir diagnóstico o asesoramiento.
- Ventana de contexto declarada de 262.144 tokens, útil para instrucciones largas y conversaciones multi-turno, aunque no hay verificación independiente.
- Integración prevista con EasyLM/WebGPU, Hydra CLI/TUI/Desktop y despliegue client-side en navegador.
- Tool calling y function calling: no documentado específicamente para el adaptador; el ecosistema Hydra menciona agentes y MCP, pero no hay evidencia de que este LoRA añada esas capacidades por sí mismo.
- Capacidades multilingües: no disponibles.
- Visión, audio o modo de razonamiento explícito: no documentados.

## Casos de uso

- Guardrail de entrada en asistentes RAG: el adaptador se coloca antes del modelo principal para detectar instrucciones maliciosas, separar system/user/tool y bloquear intentos de secuestro de instrucciones; su tamaño de ~3,5 MB permite ejecutarlo en cada petición sin añadir una segunda GPU dedicada.
- Protección SSRF en agentes que generan URLs: se usa como filtro de las llamadas a herramientas para rechazar destinos a IP privadas, metadatos de nube o rangos internos; debe complementarse con allowlists de red, resolución DNS controlada y sandboxing.
- Contención de secretos en copilotos de código: revisa salidas y argumentos de herramientas para evitar que claves, tokens o cadenas de conexión se filtren en respuestas o logs; no sustituye un gestor de secretos ni una política de rotación.
- Triaje de derivación clínica: clasifica consultas de salud y redirige a profesionales o servicios de urgencia cuando procede, evitando respuestas diagnósticas; requiere supervisión humana y políticas clínicas validadas.
- Triaje de derivación legal: identifica consultas que requieren abogado colegiado y separa orientación general de asesoramiento jurídico; no debe usarse como sustituto de revisión legal profesional.
- Pre-filtro local en navegador con EasyLM/WebGPU: al ser un adaptador de ~3,5 MB sobre una base de ~500 MB, puede cargarse en dispositivos de gama media para moderar entradas antes de enviar datos a un servidor.
- Red teaming y evaluación de robustez: sirve para probar cargas de prompt injection, jerarquía de instrucciones y exfiltración en pipelines de agentes; sus resultados deben contrastarse con suites deterministas y pruebas manuales.
- Separación de instrucciones en sistemas multiherramienta: ayuda a mantener la jerarquía de mensajes en entornos Hydra/MCP, aunque el soporte exacto de MCP no está documentado para este adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa ~3,5 MB y la base anunciada ~500 MB en formato ternario/GGUF; el adaptador no añade una carga de VRAM significativa por sí mismo.
- Estimación orientativa para contexto corto: ~1-2 GB de VRAM para pesos y overhead de runtime en cuantización ternaria o de 4 bits; no verificado. En FP16, una base de 2B ocuparía ~4 GB solo en pesos.
- Con 262.144 tokens de contexto, el KV cache puede dominar el consumo de memoria. Sin la configuración de capas, cabezas y dimensión de atención no se puede dar una cifra fiable; para servir esa ventana con concurrencia se recomienda GPU de 40-80 GB o técnicas de atención eficiente.
- GPU de desarrollo: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para contexto moderado. Para contexto muy largo y serving concurrente: A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo y en iGPU/Apple Silicon para contexto corto mediante WebGPU; para la ventana completa de 262.144 tokens no se puede garantizar en hardware de consumo.
- Opciones de despliegue: llama.cpp u Ollama con la base GGUF; EasyLM/WebGPU con el adaptador; Hydra CLI/TUI/Desktop. vLLM o TGI solo si se confirma soporte de LoRA y conversión del formato; no hay datos oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| easylm-security-bonsai-2-2b | Base 2B + LoRA de 278.516 elementos | 262.144 tokens según model card | Seguridad y guardrails | AGPL-3.0 | LoRA safetensors + base GGUF | No disponible |
| prism-ml/Ternary-Bonsai-2-2B-gguf | 2B | No disponible; la model card del adaptador declara 262.144 | Base general ternaria | No disponible | GGUF | No disponible |
| mlc-ai/Qwen3.5-2B-q4f16_1-MLC | 2B | No disponible | Base general para WebGPU/MLC | No disponible | MLC q4f16_1 | No disponible |

## Limitaciones y advertencias

- El adaptador se entrena con un fichero de 35 turnos; la cobertura de ataques, dominios y formatos es estrecha y puede sobreajustarse a ese conjunto.
- No hay benchmarks ni evaluaciones independientes: las capacidades de defensa, SSRF, contención de secretos y triaje son afirmaciones del autor.
- No se declaran idiomas soportados; no hay garantía de comportamiento multilingüe ni de calidad fuera del inglés.
- Licencia AGPL-3.0: impone obligaciones de copyleft y una cláusula específica para uso en red. Es necesario revisar su compatibilidad con productos comerciales, SaaS y distribución.
- No es un modelo autónomo: requiere una base compatible y un cargador PEFT. La ambigüedad entre la base GGUF ternaria y la base MLC Qwen3.5-2B puede provocar incompatibilidades.
- Las defensas contra prompt injection son probabilísticas; no sustituyen validación determinista, allowlists, sandboxing, control de acceso ni revisión humana.
- El bloqueo SSRF descrito no detalla implementación; podría ser eludible mediante redirecciones, DNS rebinding o codificaciones alternativas. Debe complementarse con controles de red.
- La contención de secretos no ofrece garantías criptográficas; hay que usar gestores de secretos, rotación y monitorización.
- El triaje clínico y legal no constituye diagnóstico ni asesoramiento profesional; un error puede causar daño. Requiere supervisión humana y políticas sectoriales.
- La ventana de 262.144 tokens no está verificada; el KV cache y la degradación de atención pueden limitar su utilidad real.
- Riesgo de alucinación heredado de la base; no se documentan sesgos conocidos.
- El repositorio muestra 0 descargas y 0 likes en la información disponible, por lo que la validación comunitaria es muy limitada.

## Enlaces

- https://huggingface.co/Bluebarrels/easylm-security-bonsai-2-2b
- https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus

No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
