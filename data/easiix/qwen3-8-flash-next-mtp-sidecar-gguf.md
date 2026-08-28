# EasiiX/Qwen3.8-Flash-Next-MTP-Sidecar-GGUF

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un componente auxiliar: el *draft head* de predicción multi-token (MTP) del modelo Qwen/Qwen3.8-Flash-Next, exportado como un archivo GGUF independiente (sidecar) para su uso con decodificación especulativa en llama.cpp. El autor, EasiiX, lo publica porque las conversiones GGUF estándar del modelo base eliminan los pesos MTP, impidiendo aprovechar esta técnica de aceleración. El sidecar permite que llama.cpp genere varios tokens candidatos por paso, aumentando el *throughput* de inferencia sin pérdida de calidad a temperatura 0.

El modelo base Qwen3.8-Flash-Next es un MoE multimodal de 125 mil millones de parámetros con arquitectura Qwen4, contexto de 262K tokens y capacidades de razonamiento avanzado. El sidecar MTP, con 3.878.549.248 parámetros, se distribuye en formato GGUF cuantizado a Q8_0 (4,1 GB) y está pensado para entornos con memoria unificada como el AMD Strix Halo. La licencia es Qwen Community License 1.0, con cláusula Model-as-a-Service que debe revisarse antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP draft head (multi-token prediction) para Qwen4 (qwen4exp) |
| Parametros totales | 3.878.549.248 (sidecar; el modelo base tiene 125B) |
| Parametros activos | No aplica (no es MoE, es un head denso) |
| Longitud de contexto | No disponible (depende del modelo base, que soporta 262K) |
| Tipos de cuantizacion | Q8_0 (archivo proporcionado); tambien se puede generar BF16 |
| Idiomas soportados | No disponible (hereda del modelo base) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El sidecar contiene exclusivamente los pesos del *draft head* de predicción multi-token (MTP) del modelo Qwen3.8-Flash-Next. Este head, diseñado por el equipo Qwen, predice varios tokens futuros simultáneamente a partir de la representación interna del modelo base. Durante el entrenamiento del modelo base, el head MTP se optimiza junto con el transformer principal, pero en las conversiones GGUF convencionales se descarta. Este repositorio lo recupera y lo empaqueta como un archivo independiente.

El modelo base emplea una arquitectura híbrida GDN + QSA (según el repositorio oficial de Qwen), con mejoras en atención, residual, embedding y optimización. El sidecar no añade capacidades nuevas al modelo; su función es puramente aceleradora: en decodificación especulativa, el head MTP propone hasta 4 tokens candidatos por paso, que el modelo base verifica en paralelo. A temperatura 0, el proceso es lossless (sin pérdida de calidad). No se dispone de información sobre el dataset de entrenamiento del head MTP, ya que se entrena conjuntamente con el modelo base.

## Capacidades

- Decodificación especulativa: acelera la generación de texto al proponer múltiples tokens por paso, con una tasa de aceptación medida del 85% en tareas de código.
- Compatibilidad con llama.cpp: requiere una rama específica con soporte para el MTP draft head de qwen4exp (la rama `strix-halo-qwen4exp` de Aristo94).
- Integración con el modelo base Qwen3.8-Flash-Next: funciona como un complemento que se carga junto con el GGUF principal del modelo.
- Sin pérdida de calidad a temperatura 0: la decodificación especulativa es determinista y no altera la distribución de salida.
- Optimización para hardware con memoria unificada: probado en AMD Strix Halo (Ryzen AI MAX+ 395), donde se obtienen ganancias de velocidad significativas.
- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo; requiere el modelo base.

## Casos de uso

- Inferencia local acelerada en AMD Strix Halo: el sidecar permite aumentar la velocidad de generación de 23,5 a 35,7 t/s en tareas de código, aprovechando la memoria unificada del APU sin necesidad de GPU dedicada.
- Despliegue de servidores de chat de baja latencia: al reducir el tiempo por token, se mejora la experiencia en aplicaciones conversacionales interactivas, especialmente con contexto largo (hasta 156K tokens).
- Generación de código en entornos de desarrollo: la alta tasa de aceptación (~85%) en código hace que la decodificación especulativa sea especialmente eficaz en autocompletado y generación de funciones.
- Procesamiento de documentos extensos: con contexto de 262K tokens en el modelo base, el sidecar mantiene la aceleración incluso a profundidades de contexto elevadas, útil para análisis de codebases completos o informes largos.
- Optimización de costes en infraestructura: al mejorar el *throughput* sin necesidad de hardware adicional, se reduce el coste por token en despliegues locales o en la nube con GPUs compartidas.
- Investigación en decodificación especulativa: el repositorio sirve como referencia para implementar y evaluar MTP sidecars en otros modelos de la familia Qwen4.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card del autor, medidos en AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151) con el modelo base cuantizado a UD-IQ3_XXS y temperatura 0:

| Metrica | Sin sidecar | Con sidecar | Mejora |
|---|---|---|---|
| Velocidad de decodificacion (codigo) | 23,5 t/s | 35,7 t/s | +50% |
| Tasa de aceptacion (codigo) | - | ~85% | - |
| Velocidad a 156K contexto | - | +49% | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para el sidecar, ya que no es un modelo independiente. El rendimiento depende del modelo base y de la configuración de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el sidecar se carga en memoria unificada junto con el modelo base. El modelo base Qwen3.8-Flash-Next requiere aproximadamente 78 GB de RAM/memoria unificada según Unsloth.
- GPU recomendadas: probado en AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151). No requiere GPU dedicada con VRAM; funciona con memoria unificada.
- Compatibilidad con consumer GPU: no se ha probado en GPUs convencionales; la rama de llama.cpp incluye parches específicos para Strix Halo.
- Opciones de despliegue: llama.cpp (rama `strix-halo-qwen4exp`), con `llama-server` o `llama-cli`. No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: en el hardware de prueba, 35,7 t/s en código con contexto estándar y +49% a 156K tokens. La latencia por token depende del tamaño del modelo base y de la cuantización.

## Comparativa con modelos similares

No hay una comparativa directa con otros sidecars MTP, ya que es un componente especializado. Se puede comparar con la situación sin sidecar (inferencia estándar) y con alternativas de decodificación especulativa:

| Configuracion | Velocidad (codigo) | Complejidad | Licencia |
|---|---|---|---|
| Qwen3.8-Flash-Next sin sidecar | 23,5 t/s | Baja (GGUF estándar) | qwen-community-1.0 |
| Qwen3.8-Flash-Next con sidecar MTP | 35,7 t/s | Media (rama especifica de llama.cpp) | qwen-community-1.0 |
| Otros draft heads (ngram, prompt lookup) | No disponible | Baja | Varía |

El sidecar de EasiiX es el único publicado específicamente para Qwen3.8-Flash-Next en formato GGUF, aunque existe trabajo comunitario relacionado (dzannotti) con MTP GGUF para otros modelos.

## Limitaciones y advertencias

- No es un modelo completo: requiere el modelo base Qwen3.8-Flash-Next y no funciona de forma autónoma.
- Dependencia de una rama específica de llama.cpp: la rama `strix-halo-qwen4exp` no es oficial y puede no recibir mantenimiento a largo plazo.
- Rendimiento variable según el tipo de texto: la ganancia es mayor en código (~85% aceptación) que en prosa; el autor recomienda usar `--spec-draft-p-min 0.75` para evitar pérdidas en texto de baja aceptación.
- Licencia con cláusula Model-as-a-Service: la Qwen Community License 1.0 restringe el uso del modelo como servicio comercial; debe revisarse antes de desplegar en producción.
- Soporte de hardware limitado: las mediciones se realizaron únicamente en AMD Strix Halo; no hay garantía de funcionamiento en otras plataformas.
- Riesgo de alucinación y sesgos: heredados del modelo base, no mitigados por el sidecar.
- Fecha de publicación futura (agosto de 2026) y cero descargas: el repositorio es reciente y no tiene validación comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EasiiX/Qwen3.8-Flash-Next-MTP-Sidecar-GGUF
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Rama de llama.cpp con soporte qwen4exp: https://github.com/Aristo94/llama.cpp/tree/strix-halo-qwen4exp
- PR de llama.cpp para MTP draft head: https://github.com/ggml-org/llama.cpp/pull/27739
- PR de llama.cpp para soporte qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de Unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
