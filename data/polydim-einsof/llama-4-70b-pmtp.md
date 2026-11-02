# Polydim-Einsof/llama-4-70b-pmtp

## Resumen

`llama-4-70b-pmtp` es un adaptador publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF, construido sobre el modelo base `meta-llama/Llama-4-70B-Instruct`. El repositorio no contiene pesos completos del modelo (el tamaño total del repo es de 0,1 GB), sino una capa de adaptación que el autor describe como una alineación estructural de subespacio macro sobre la variedad de Stiefel, con una proyección de dimensión `d_model = 8192` a `d_canonical = 2048` y un "defecto de Stiefel" declarado de 3,72e-09 medido con acumulador Neumaier en FP64.

La propuesta técnica se aleja de los adaptadores convencionales (LoRA, QLoRA o prefix tuning) y se presenta como un mecanismo de transferencia de "pensamiento continuo" mediante un bus de memoria compartida (`PmtpShmBus`) y un protocolo denominado Zero-Worm, que evita la serialización intermedia en JSON o Markdown. El autor menciona además la integración de 1.740 teoremas formales almacenados en PostgreSQL 16 mediante la extensión `polydim_vec_db`, lo que sugiere un pipeline de verificación geométrica más que un ajuste supervisado clásico.

Es relevante ahora porque ejemplifica una corriente de investigación que aplica geometría diferencial (variedades de Stiefel, subespacios principales) al ajuste fino de modelos grandes, un área con poca literatura reproducible. No obstante, la ausencia de model card detallada, benchmarks, datos de entrenamiento y pesos verificables hace que deba tratarse como un artefacto de investigación preliminar y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Llama 4 70B Instruct); adaptador geométrico sobre subespacio de Stiefel St(8192, 2048) |
| Parametros totales | no disponible (el repo pesa 0,1 GB; no contiene pesos completos del base de 70B) |
| Parametros activos | no disponible (el modelo base no se documenta como MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 4 Community License (`license: llama4`) |
| Formato de pesos | safetensors (tag del repo); el adaptador se describe como compatible con C++20 / Rust 2024 / AVX2 |
| Modelo base | `meta-llama/Llama-4-70B-Instruct` |
| Dimension de proyeccion | 8192 → 2048 |
| Defecto de Stiefel | 3,72e-09 (acumulador Neumaier FP64) |
| Teoremas integrados | 1.740 (PostgreSQL 16, `polydim_vec_db`) |
| Tag Ollama | `llama4:70b` |

## Arquitectura y entrenamiento

El adaptador se apoya en el transformer del modelo base Llama 4 70B Instruct y añade una capa de proyección geométrica que mapea el espacio de representación de dimensión 8192 a un subespacio canónico de dimensión 2048 sobre la variedad de Stiefel St(8192, 2048), inmersa en la esfera S^2047. El autor reporta un defecto de ortogonalidad de 3,72e-09 calculado con un acumulador compensado de Neumaier en doble precisión, lo que indica que la construcción del subespacio se realiza con cuidado numérico explícito. La integración se describe como "Macro Subspace Structural Alignment", es decir, una alineación estructural del subespacio principal en lugar de un ajuste de pesos por gradiente descendente convencional.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. El autor menciona la incorporación de 1.740 teoremas formales extraídos de una base de datos PostgreSQL 16 con la extensión `polydim_vec_db`, lo que apunta a un proceso de verificación geométrica y consistencia estructural más que a un corpus lingüístico. El "Zero-Worm Protocol" se presenta como un mecanismo de transferencia de estado continuo entre módulos mediante un identificador `SLAB_ID` sobre un bus de memoria compartida IEEE-754 FP64, evitando la serialización intermedia en JSON o Markdown; no se aportan detalles sobre cómo se implementa en la práctica ni sobre su impacto medible en calidad.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base `meta-llama/Llama-4-70B-Instruct`, aunque no se documentan evaluaciones específicas del adaptador.
- Alineación estructural de subespacios: proyección geométrica de representaciones de dimensión 8192 a 2048 sobre la variedad de Stiefel.
- Transferencia de estado continuo: el protocolo Zero-Worm propone comunicación entre módulos sin serialización intermedia JSON/Markdown.
- Verificación formal: integración declarada de 1.740 teoremas desde PostgreSQL 16 para validación estructural.
- Compatibilidad con tooling nativo: contrato de silicio con C++20, Rust 2024, AVX2 y bus de memoria compartida FP64.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas del adaptador no se especifican.

## Casos de uso

- Investigación en geometría de representaciones: el adaptador permite experimentar con proyecciones sobre la variedad de Stiefel y medir el efecto del defecto de ortogonalidad en la calidad de las representaciones internas, útil para grupos que estudian ajuste fino geométrico.
- Prototipado de buses de estado continuo: el protocolo Zero-Worm y el `PmtpShmBus` pueden servir como base para experimentos de comunicación entre módulos sin serialización, por ejemplo en pipelines multiagente de baja latencia.
- Verificación formal de restricciones estructurales: la integración con `polydim_vec_db` y los 1.740 teoremas permiten probar flujos de validación automática de propiedades geométricas en modelos grandes.
- Reproducción académica: al estar construido sobre Llama 4 70B Instruct, sirve para comparar adaptadores geométricos frente a LoRA o QLoRA en tareas de alineación, siempre que se disponga del modelo base y de la licencia correspondiente.
- Experimentación con inferencia nativa: el contrato C++20/Rust 2024/AVX2 permite integrar el adaptador en servicios de inferencia de alto rendimiento que ya operen con Llama 4 70B.
- Docencia y divulgación: como ejemplo didáctico de aplicación de variedades de Stiefel y acumuladores de Neumaier al ajuste de modelos, aunque con las cautelas propias de un artefacto sin benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Llama 4 70B Instruct requiere típicamente varios aceleradores de gama alta, pero no se aportan cifras concretas en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del base se intuye necesidad de A100/H100 o múltiples GPU, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible; el repo del adaptador pesa 0,1 GB, pero la inferencia requiere cargar el modelo base completo.
- Opciones de despliegue: tag Ollama `llama4:70b` mencionado por el autor; compatible con el stack nativo C++20 / Rust 2024 / AVX2 descrito. No se confirma soporte de vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `llama-4-70b-pmtp` | no disponible (base 70B) | no disponible | Llama 4 Community | safetensors + stack nativo | Adaptador geométrico Stiefel; sin benchmarks publicados |
| `meta-llama/Llama-4-70B-Instruct` | 70B (aprox.) | no disponible en esta ficha | Llama 4 Community | safetensors | Modelo base instructivo de referencia |
| Adaptadores LoRA/QLoRA sobre Llama 4 70B | depende del rango | heredado del base | Llama 4 Community | safetensors / PEFT | Enfoque estándar de ajuste fino; ampliamente soportado por vLLM, TGI y PEFT |
| Adaptadores de alineación geométrica (familia Stiefel) | variable | variable | variable | variable | Línea de investigación minoritaria; sin comparativas públicas consolidadas |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se publican métricas del adaptador ni del base en esta ficha.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de alineación que permitan validar la calidad del adaptador.
- Model card incompleta: no se documentan datos de entrenamiento, composición del corpus, hiperparámetros ni proceso de validación.
- Repositorio de 0,1 GB: no contiene pesos completos del base de 70B; el usuario debe descargar `meta-llama/Llama-4-70B-Instruct` por separado y aceptar su licencia.
- Licencia Llama 4 Community: restricciones de uso comercial, cláusulas de atribución y límites de usuarios mensuales aplicables; revisar el texto completo antes de cualquier despliegue.
- Riesgo de alucinación: heredado del modelo base; no se aportan mitigaciones específicas del adaptador.
- Idiomas: no se especifican los idiomas soportados por el adaptador; no asumir cobertura multilingüe más allá de la del base.
- Madurez: proyecto de investigación independiente, sin descargas ni likes en el momento de la ficha, sin revisión por pares ni reproducibilidad verificada.
- Dependencia de stack nativo: el contrato C++20 / Rust 2024 / AVX2 y el bus `PmtpShmBus` limitan la portabilidad a entornos que no dispongan de esa infraestructura.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Polydim-Einsof/llama-4-70b-pmtp
- Repositorio del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/meta-llama/Llama-4-70B-Instruct
- Licencia Llama 4: https://www.llama.com/llama4/license/
