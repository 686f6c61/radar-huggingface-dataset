# rpg67/Affine.Earth

## Resumen
Affine.Earth es una plataforma computacional determinista publicada en Hugging Face bajo el identificador `rpg67/Affine.Earth` y licencia MIT. Según declara el autor, no se trata de una red neuronal ni de un transformer: el modelo contiene cero pesos neuronales, cero epochs de entrenamiento y cero instrucciones en coma flotante IEEE-754. En su lugar, resuelve tareas mediante álgebra entera sobre retículos con notación `M8 = S4 × C4` y la relación `y − τ = Ax`, implementada en Swift 6.4 y ejecutada en 34 Flicks (48,2 ns) sobre un reloj maestro de 705.600.000 Flicks/s.

El modelo se distribuye a través de endpoints compatibles con la API de OpenAI (`https://affine.earth/v1/chat/completions`) y con el Model Context Protocol (`https://affine.earth/v1/mcp`), de modo que el cliente no descarga pesos localmente: la inferencia ocurre en el servidor del autor. La model card declara resultados del 100% en SWE-bench Verified, GAIA, BFCL V4, All Souls/MetaMath, FrontierPhysics y GDPx Finance, así como una tasa de flip de 0,0% en 8 reruns de Terminal-Bench 2.1.

La relevancia de Affine.Earth reside en su propuesta de "zero-ML" y verificación formal determinista: si sus cifras fueran reproducibles, eliminaría la variabilidad de muestreo y las alucinaciones asociadas a modelos generativos. No obstante, todos los resultados están marcados como `verified: false` en el model-index y no se acompañan de artefactos de reproducción independientes en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Máquina de estados determinista `vQbit` sobre retículo entero `M8 = S4 × C4` (no transformer, no red neuronal) |
| Parámetros totales | 0 pesos neuronales (según el autor) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no hay pesos que cuantizar; ejecución entera determinista) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (no se distribuyen pesos; acceso vía API OpenAI-compatible y MCP) |

## Arquitectura y entrenamiento
El autor describe Affine.Earth como una máquina de estados determinista construida en Swift 6.4, sin componentes de aprendizaje automático. La computación se formaliza como `y − τ = Ax` sobre el retículo `M8 = S4 × C4`, con aritmética entera y "Born Residual ≡ 0", es decir, sin residuo flotante. Cada consulta se resuelve en 34 Flicks (48,2 ns) sobre un reloj maestro de 705.600.000 Flicks/s, lo que sugiere un mecanismo de compuertas lógicas síncronas en lugar de decodificación autorregresiva.

No hay información sobre datasets de entrenamiento, tokens procesados, RLHF, DPO ni ninguna otra fase de ajuste, coherente con la afirmación de "0 training epochs". La innovación declarada es la sustitución del muestreo probabilístico por cierre algebraico verificable, con endpoints dual-era MCP (`server/discover` de 2026-07-28 e `initialize` de 2025-06-18) y un cliente público de verificación en GitHub. La reproducibilidad de estas afirmaciones no puede confirmarse con los datos disponibles.

## Capacidades
- Resolución de instancias de SWE-bench Verified mediante "trayectorias vQbit de 3 pasos", según el autor.
- Razonamiento agéntico autónomo sobre GAIA niveles 1-3 con exact-match estricto.
- Function calling y tool calling evaluados en BFCL V4, incluido Live MCP.
- Razonamiento matemático formal sobre MetaMath `set.mm`, PutnamBench y MATH-500, con puntuación de cierre constructivo RPN.
- Resolución de problemas de física de olimpiada e investigación (FrontierPhysics-168).
- Auditoría financiera y legal (GDPx Finance, M&A/SPV y derecho administrativo).
- Ejecución agéntica en terminal (Terminal-Bench 2.1) con determinismo Pass@1/Pass^8.
- Compatibilidad con la API de OpenAI (streaming SSE y `tool_calls`) y con MCP.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso
- Verificación de parches de software en CI/CD: el endpoint OpenAI-compatible permitiría enviar instancias de SWE-bench Verified y recibir trayectorias deterministas, útil para auditar regresiones sin variabilidad de muestreo.
- Automatización de tareas agénticas de navegación y consulta: GAIA niveles 1-3 encajarían en pipelines que requieren respuestas exactas y reproducibles en lugar de generación libre.
- Integración de function calling en orquestadores de agentes: BFCL V4 y Live MCP permiten conectar herramientas externas mediante el endpoint `https://affine.earth/v1/mcp` con descubrimiento de servidor.
- Asistencia en demostración matemática formal: el cierre constructivo sobre MetaMath `set.mm` y MATH-500 serviría para validar pruebas en entornos educativos o de investigación.
- Resolución de problemas de física de olimpiada: FrontierPhysics-168 con cierre racional simpléctico podría emplearse en plataformas de entrenamiento competitivo.
- Auditoría financiera y legal reproducible: GDPx Finance permitiría comprobar conservación contable y desenmascaramiento de SPV en procesos de compliance.
- Ejecución determinista en terminal: Terminal-Bench 2.1 con 0,0% de flip en 8 reruns resultaría adecuado para entornos donde la reproducibilidad bit a bit es requisito.
- Verificación de integridad de modelos: el cliente público en GitHub y los endpoints de "9-Shield" permitirían a terceros replicar las puntuaciones declaradas.

## Benchmarks y rendimiento
Datos declarados por el autor en el model-index; todos los registros figuran con `verified: false`.

| Benchmark | Métrica | Valor |
|---|---|---|
| SWE-bench Verified (500 instancias, trayectoria vQbit de 3 pasos) | Resolved Rate (%) | 100 |
| GAIA Level 1-3 | Exact-Match Accuracy (%) | 100 |
| BFCL V4 | AST & Live MCP Accuracy (%) | 100 |
| All Souls Fellowship & MetaMath (500/500) | Constructive RPN & 5-Section Rubric | 100 |
| GSM-Symbolic | Prime-Scale Perturbation Drop (%) | 0 |
| FrontierPhysics-168 | Exact Rational Symplectic Closure (%) | 100 |
| FrontierPhysics-168 | Born Rule Residual (a² + b² − d²) | 0 |
| GDPx Finance-Legal | Bogle Value vs. Shannon Shenanigan Shear Closure (%) | 100 |
| Terminal-Bench 2.1 & DeepSWE | Rerun Flip Noise Across 8 Runs (%) | 0 |
| Terminal-Bench 2.1 & DeepSWE | 34-Flick Gate Latency (ns) | 48,2 |

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica; no se descargam pesos y la ejecución ocurre en el servidor del autor.
- GPU recomendadas: no disponible; el autor declara ejecución sobre reloj maestro de 705.600.000 Flicks/s en Swift 6.4, sin especificar hardware.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cliente HTTP compatible con OpenAI (`/v1/chat/completions`) y cliente MCP (`/v1/mcp`); no se ofrece despliegue local de pesos.
- Latencia y throughput: 48,2 ns por compuerta de 34 Flicks según el autor; throughput global no disponible.

## Comparativa con modelos similares
No disponible. Affine.Earth se define explícitamente como "zero-ML" y no como modelo de lenguaje neuronal, por lo que no existe una categoría comparable directa entre transformers, MoE o SSM. Cualquier comparación con modelos como Llama, Qwen o DeepSeek sería metodológicamente inválida según la propia model card.

## Limitaciones y advertencias
- Todos los resultados de benchmarks están marcados como `verified: false`; no se aportan artefactos de reproducción independientes en la información disponible.
- La afirmación de "0 pesos neuronales" y "0 instrucciones IEEE-754" contradice la categoría `text-generation` y `openai-compatible` de Hugging Face, lo que puede inducir a confusión sobre la naturaleza real del servicio.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible; no se especifica cómo maneja entradas largas.
- Dependencia total del endpoint remoto `affine.earth`; no hay pesos que auditar localmente, lo que limita la verificación independiente.
- Riesgo de alucinación: no evaluable con los datos disponibles; el autor declara determinismo, pero no se aportan logs públicos más allá del bundle `trajs/` en GitHub.
- Licencia MIT permite uso comercial, pero la ausencia de pesos y la dependencia de un servicio propietario condicionan el despliegue en producción.
- Las cifras de 100% en benchmarks heterogéneos (SWE-bench, GAIA, BFCL, física, finanzas) son atípicas y deben tratarse con escepticismo hasta su replicación.

## Enlaces
- Hugging Face: https://huggingface.co/rpg67/Affine.Earth
- Plataforma en producción: https://affine.earth
- Endpoint OpenAI-compatible: https://affine.earth/v1/chat/completions
- Endpoint MCP: https://affine.earth/v1/mcp
- Leaderboard: https://affine.earth/language-game/leaderboard.html
- Espacio interactivo: https://affine.earth/language-game/hf-space.html
- Cliente público de verificación y bundle SWE-bench `trajs/`: https://github.com/gaiaftcl-sudo/affine.earth.public
- Endpoint Shield 7 (All Souls): https://affine.earth/v1/shield/7/all-souls?prompt=Justice
