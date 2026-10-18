# singularity-layer/Singularity-xMESH-0.8B

## Resumen
Singularity xMESH 0.8B es un modelo compacto de decisión de singularity-layer para seleccionar servicios y componer flujos multi-etapa x402 con restricciones. Es un checkpoint standalone de 873.438.784 parámetros, derivado de Qwen/Qwen3.5-0.8B, con pesos safetensors y licencia Apache-2.0.

No es un modelo de chat general: recibe una intención, restricciones duras y un conjunto pequeño de candidatos de un catálogo x402, y devuelve selección o abstención, confianza calibrada, requisito de aprobación, compatibilidad de red y nivel de coste. Una política determinista valida las etapas y la viabilidad antes de cualquier petición de pago.

Su interés práctico es el despliegue local: CPU y Apple silicon MPS verificados en un M4 con 16 GB, con un contrato de contexto de 2048 tokens. Está especializado en inglés y en enrutado x402, no en razonamiento general ni en generación abierta.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B; incluye cabeza de decisión conjunta calibrada y política xMESH determinista. No se detallan más componentes internos. |
| Parámetros totales | 873.438.784 (873M) |
| Longitud de contexto | 2048 tokens (contrato de runtime validado) |
| Tipos de cuantización | No disponible; checkpoint en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Modelo de decisión y enrutado para selección de servicios x402 |
| Hardware verificado | Apple silicon MPS (M4, 16 GB) y CPU; CUDA pendiente de canary standalone; ROCm no verificado |

## Arquitectura y entrenamiento
El checkpoint es un export standalone que contiene el modelo, una cabeza de decisión conjunta calibrada y la política xMESH determinista, sin necesidad de descargar el modelo base por separado. La política comprueba stage gates y viabilidad antes de cualquier petición de pago; el modelo produce la selección, la confianza, el requisito de aprobación, la compatibilidad de red y el nivel de coste. No se especifican en la información disponible el número de capas, el tipo de atención ni otras innovaciones de arquitectura.

El entrenamiento combina un warm-up general de decisiones con filas licenciadas de MaziyarPanahi/AgentToolDecisions-180K y filas x402 curadas por Singularity. Los casos y recursos de evaluación congelados se excluyeron del entrenamiento. No se documentan el número de tokens, la composición exacta del dataset ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades
- Selección de servicio o candidato a partir de una intención, restricciones duras y un conjunto pequeño de candidatos recuperados de un catálogo x402.
- Abstención como salida prevista cuando no se selecciona ningún candidato.
- Salida estructurada con confianza calibrada, requisito de aprobación, compatibilidad de red y nivel de coste.
- Composición de flujos multi-etapa x402 con validación de stage gates y viabilidad mediante política determinista.
- Tool-selection orientada a candidatos x402; no se documenta function calling genérico.
- Uso como cabecera de decisión advisory en agentes: elige etapas o endpoints, pero no ejecuta el flujo.
- Ejecución en CPU y Apple silicon MPS; CUDA soportado por el runtime PyTorch, con canary standalone pendiente.
- Inglés únicamente.
- No se documentan visión, audio, modo thinking ni generación de texto abierta.

## Casos de uso
- Enrutado de llamadas a APIs de pago: un agente recupera un catálogo pequeño de endpoints x402 y el modelo elige el candidato o se abstiene según intención, restricciones, red y coste; el runtime aplica después presupuestos y aprobaciones.
- Preflight de flujos x402: antes de iniciar un flujo de varias etapas, el modelo propone la secuencia y la política determina si las etapas son viables; se evita lanzar peticiones de pago con stage gates incompatibles.
- Aprobación humana selectiva: el campo de requisito de aprobación permite derivar a revisión las decisiones con coste alto, red no compatible o confianza baja; el modelo no sustituye la política.
- Abstención segura ante catálogos incompletos: si los candidatos recuperados no cubren las restricciones, el modelo puede abstenerse en lugar de inventar un endpoint; el runtime limita los IDs a los recuperados.
- Asistente local para desarrolladores: en un portátil Apple M4 de 16 GB o en CPU, el modelo puede recomendar servicios x402 y niveles de coste sin depender de una API externa; la latencia medida es de 6,45 s medianos por flujo multi-campo.
- Auditoría y comparación de proveedores: registrar selección, confianza, coste y aprobación para analizar el coste ejecutado y el cumplimiento de stage gates en un conjunto de casos congelado.
- Integración en orquestadores de agentes: como cabecera de decisión previa a la ejecución, para determinar qué candidato encaja y si requiere aprobación, manteniendo la ejecución en el orquestador.
- Evaluación de catálogos x402: comparar configuraciones de recuperación y candidatos midiendo coincidencia de flujo, stage gates y coste; el modelo es pequeño y se puede ejecutar en local.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible. El autor publica una evaluación congelada de 80 casos sobre flujos x402:

| Evaluación, 80 casos | xMESH standalone | Jev | Laya |
|---|---:|---:|---:|
| Coincidencia exacta de flujo completo | 80,0 % | 11,25 % | 0,0 % |
| Precisión de stage gates | 96,25 % | 86,5 % | 78,5 % |
| Precisión de servicio activo | 97,5 % | 100,0 % | 85,63 % |
| Precisión de decisión global | 96,25 % | 37,5 % | 35,63 % |
| Coste ejecutado | 0,00175 USD | 0,00000 USD | 0,00358 USD |
| Violaciones posteriores a la política | 0 | — | — |

Jev es una API alojada y Laya utilizó un runtime local distinto, por lo que la latencia no es una comparación equivalente en hardware. La validación standalone en CPU midió 6,45 segundos medianos por flujo multi-campo completo en un Apple M4; runtimes de servicio optimizados pueden ser sustancialmente más rápidos.

## Requisitos de hardware
- VRAM estimada: no hay cifra oficial. El checkpoint tiene 873M parámetros en BF16 y el repositorio ocupa 1,8 GB; los pesos suponen aproximadamente 1,75 GB (873M × 2 bytes), sin contar activaciones, caché KV ni runtime. El autor indica 8 GB de sistema como mínimo práctico y 16 GB recomendado.
- GPU recomendadas: no se especifican modelos concretos. La única configuración verificada es Apple silicon MPS en un M4 con 16 GB de memoria unificada; CPU también está verificado.
- GPU de consumo: solo está documentado y verificado el caso de Apple M4 con 16 GB. No se documenta compatibilidad verificada con RTX 4090, A100, H100 u otras GPU.
- CUDA: soportado por el runtime PyTorch, pero el canary standalone de CUDA está pendiente. ROCm no está verificado.
- Opciones de despliegue: Transformers y PyTorch mediante `examples/inference.py`, con `--device mps` o `--device cpu`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,45 s medianos por flujo multi-campo completo en la validación standalone en CPU sobre Apple M4. No se publica throughput.

## Comparativa con modelos similares
Los únicos comparadores publicados son Jev y Laya, con información muy limitada sobre parámetros, contexto y licencia.

| Modelo | Tipo y disponibilidad | Parámetros | Contexto | Flujo completo exacto | Decisión global | Licencia |
|---|---|---|---:|---:|---:|---|
| Singularity xMESH 0.8B | Modelo local standalone en HuggingFace | 873M | 2048 tokens | 80,0 % | 96,25 % | Apache-2.0 |
| Jev | API alojada; disponibilidad no detallada | No disponible | No disponible | 11,25 % | 37,5 % | No disponible |
| Laya | Runtime local distinto; disponibilidad no detallada | No disponible | No disponible | 0,0 % | 35,63 % | No disponible |

Jev supera a xMESH en precisión de servicio activo (100,0 % frente a 97,5 %) y en coste ejecutado (0,00000 USD frente a 0,00175 USD), pero obtiene mucha menor precisión global y de flujo completo. La comparación no es equivalente en hardware ni en condiciones de ejecución.

## Limitaciones y advertencias
- Modelo especializado en enrutado de servicios x402; no es un modelo de chat general ni un generador de texto abierto.
- Solo admite inglés. No hay validación documentada en otros idiomas.
- El contrato de contexto validado es de 2048 tokens, adecuado para conjuntos pequeños de candidatos, no para catálogos extensos.
- No recupera servicios, no verifica proveedores, no cotiza pagos y no ejecuta peticiones.
- La selección de servicio no es perfecta: la precisión de servicio activo es del 97,5 % y la de flujo completo del 80,0 %. Puede elegir un candidato incorrecto o una combinación no viable.
- La confianza es advisory y no sustituye las comprobaciones deterministas de política.
- Límite de seguridad: no debe recibir secretos de wallet, construir pagos firmados, omitir aprobaciones, inventar endpoints ni ejecutar URLs arbitrarias. El runtime debe restringir los IDs a los candidatos recuperados y aplicar presupuestos, redes, esquemas y reglas de aprobación de forma independiente.
- No se documenta una evaluación de sesgos. El entrenamiento usa AgentToolDecisions-180K y filas x402 curadas, por lo que puede heredar sesgos de selección o cobertura de proveedores de esos datos.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio incluye THIRD_PARTY_NOTICES.md con atribución a Qwen y Cloudflare Clef; deben revisarse las obligaciones de terceros.
- El pipeline de HuggingFace figura como image-text-to-text, pero la model card no documenta capacidades de visión; no debe asumirse entrada de imágenes.
- CUDA standalone sigue pendiente de canary y ROCm no está verificado. La latencia de 6,45 s por flujo en CPU/M4 no es adecuada para alto throughput sin un runtime optimizado.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B)
- [Modelo base Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Dataset AgentToolDecisions-180K](https://huggingface.co/datasets/MaziyarPanahi/AgentToolDecisions-180K)
- No se han encontrado papers, blogs, repositorios o demos adicionales relevantes en la búsqueda web; los resultados obtenidos tratan sobre el concepto de singularidad tecnológica, Singularity Viewer y Sylabs Singularity, no sobre este modelo.
