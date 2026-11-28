# shivanshDIMRI/code-security-auditor-qwen

## Resumen

Code Security Auditor v2 es un adaptador LoRA de tipo PEFT publicado por el usuario shivanshDIMRI sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Su propósito es especializar un modelo pequeño de generación de código en la auditoría de seguridad: detectar vulnerabilidades en código fuente, asignar identificadores CWE de MITRE, estimar severidad CVSS, explicar el vector de explotación y proponer un parche corregido listo para producción.

El adaptador se ha entrenado sobre 4.568 trazas conversacionales en formato ChatML centradas en escenarios CVE/CWE multilingües, con especial énfasis en Rust, Java, Ruby y PHP (más de 1.100 ejemplos por lenguaje), y cobertura adicional de Python, C/C++, Go, JavaScript/TypeScript y Solidity. Incluye aproximadamente un 15 % de fragmentos ya securizados como controles negativos para calibrar falsos positivos.

Es relevante porque aborda una tarea de nicho (revisión de seguridad de código) con un modelo de solo 1.500 millones de parámetros y licencia Apache 2.0, lo que permite despliegue local en hardware de consumo. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador, no el modelo base completo. El modelo está pensado exclusivamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder) con adaptador LoRA (PEFT) |
| Parámetros totales | 1.500 millones en el modelo base; adaptador LoRA con r=16 sobre 7 módulos de proyección |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; cuantización posible vía el modelo base, no documentada) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El ajuste se realizó mediante LoRA con rango r=16, alpha=32 y módulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se ejecutó en bfloat16 sobre una NVIDIA GeForce RTX 5070 (arquitectura Blackwell sm_120) con PyTorch 2.11+cu128.

El conjunto de datos consta de 4.568 trazas ChatML de auditoría de seguridad multilingüe más 240 registros de validación estratificada. La distribución por lenguaje incluye más de 1.100 ejemplos para cada uno de Rust, Java, Ruby y PHP, con cobertura adicional de Python, C/C++, Go, JavaScript/TypeScript y Solidity. Los ejemplos cubren patrones concretos como desreferencia de punteros en `unsafe` de Rust (CWE-787/CWE-119), doble liberación y use-after-free (CWE-415/CWE-416), inyección JNDI/Log4Shell (CWE-917/CVE-2021-44228), deserialización insegura (CWE-502), inyección SQL (CWE-89), path traversal (CWE-22), XSS (CWE-79), inyección de comandos (CWE-78) y ejecución de código (CWE-94). Aproximadamente el 15 % de las muestras son fragmentos ya securizados que actúan como controles negativos para reducir falsos positivos.

No se documenta en la información disponible el uso de RLHF, DPO ni innovaciones de decodificación específicas; el entrenamiento se limita a fine-tuning supervisado sobre trazas conversacionales.

## Capacidades

- Detección de vulnerabilidades en código fuente con asignación de identificadores CWE de MITRE.
- Estimación de severidad mediante CVSS.
- Explicación del vector de explotación del adversario para cada hallazgo.
- Generación de parches corregidos listos para producción.
- Cobertura multilingüe de lenguajes: Rust, Java, Ruby, PHP, Python, C/C++, Go, JavaScript/TypeScript y Solidity.
- Calibración de falsos positivos mediante controles negativos ya securizados.
- Formato conversacional ChatML con roles system/user/assistant.
- Generación de texto en inglés (único idioma declarado).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Revisión de seguridad en pipelines de CI/CD: el adaptador puede invocarse sobre los diffs de un pull request para señalar CWE y severidad antes del merge, con un modelo de 1,5 B que cabe en GPU de consumo y mantiene coste bajo por revisión.
- Auditoría de código Rust con `unsafe`: detecta desreferencias de punteros crudos, doble liberación con `Box::from_raw`, condiciones de carrera por `unsafe impl Send/Sync` y desbordamientos en layouts de asignación, un nicho poco cubierto por auditores genéricos.
- Revisión de aplicaciones Java empresariales: identifica inyección JNDI/Log4Shell, deserialización insegura con `ObjectInputStream`, Jackson o XStream, y expresiones SpEL con riesgo de RCE.
- Análisis de aplicaciones Rails y Ruby: detecta `YAML.load` y `Marshal.load` con riesgo de RCE, inyección de comandos vía `Kernel#open`, mass assignment y XSS por `.html_safe` o `raw`.
- Auditoría de código PHP legado: localiza object injection por `unserialize()`, inclusión local/remota de ficheros, inyección SQL en `mysqli_query` y bypass por type juggling con magic hash.
- Formación y concienciación en seguridad: el modelo genera explicaciones del vector de explotación junto al parche, lo que sirve como material didáctico para revisores junior en revisiones de código.
- Triaje previo a auditoría manual: como primera pasada sobre repositorios grandes, prioriza los fragmentos con mayor severidad CVSS estimada para que el equipo humano centre el esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5 B en bfloat16 requiere aproximadamente 3 GB de VRAM; en cuantización de 8 bits, alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB (estimaciones para el modelo base, no verificadas para el adaptador).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; el autor entrenó en una RTX 5070 (Blackwell, sm_120).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: transformers con PEFT (método documentado por el autor); el adaptador puede fusionarse con el modelo base para usar vLLM, TGI, llama.cpp u Ollama, aunque estas rutas no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-security-auditor-qwen (este) | 1,5 B (base) + LoRA | No disponible | Auditoría CVE/CWE multilingüe | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | No disponible en esta ficha | Generación de código general | Apache 2.0 | Hugging Face |
| Modelos de auditoría de seguridad de mayor tamaño | No disponible | No disponible | Auditoría de seguridad | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas publicadas que permitan contrastar el rendimiento de este adaptador frente a alternativas especializadas.

## Limitaciones y advertencias

- El modelo solo está entrenado y declarado para inglés; las explicaciones y los parches se generan en ese idioma.
- Riesgo de alucinación: puede inventar identificadores CWE, puntuaciones CVSS o parches que no corrigen realmente la vulnerabilidad; toda salida requiere validación humana.
- Sesgo de dominio: el entrenamiento se concentra en Rust, Java, Ruby y PHP; la cobertura de Python, C/C++, Go, JavaScript/TypeScript y Solidity es menor y la calidad puede degradarse en esos lenguajes.
- El adaptador no incluye el modelo base: es necesario descargar Qwen/Qwen2.5-Coder-1.5B-Instruct por separado y cargarlo con PEFT.
- Modelo de 1,5 B: capacidad limitada para razonamientos de seguridad complejos, cadenas de explotación multi-componente o análisis de repositorios completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la exactitud de los hallazgos recae en el integrador.
- No se documentan garantías de robustez frente a código ofuscado, generado o deliberadamente adversario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivanshDIMRI/code-security-auditor-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
