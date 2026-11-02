# D-URing/mxi_Hybrid_v0_preview

## Resumen

mxi_Hybrid_v0_preview es un modelo de robótica publicado por D-URing bajo el tag `robotics` y el pipeline `robotics`, distribuido como un paquete completo que incluye el modelo conjunto S4000, un runtime de inferencia para Linux x86_64 y los artefactos de normalización. El repositorio ocupa 75,1 GB en formato safetensors y está diseñado para cargarse en conjunto: planner, modelo de acción, modelos base y normalización deben instanciarse de forma coordinada, apuntando el adaptador a la ruta `model/` y no a la raíz del repositorio ni a un fichero de acción aislado.

El modelo se enmarca en el ecosistema MXI (adaptador XPolicyLab disponible en el repositorio GitHub del autor) y en la línea de trabajo RoboDojo. La model card indica que se trata de una "preview" con un alcance de aceptación limitado: una comprobación real de protocolo, un rollout exitoso de `stack_blocks` y una comprobación numérica de migración con observación fija repetida dos veces. El autor advierte explícitamente de que esto no constituye una puntuación oficial de leaderboard ni una afirmación de equivalencia general.

La relevancia del modelo es acotada y muy específica: no es un LLM de propósito general, sino un artefacto de robótica orientado a evaluación en simulador, con requisitos de hardware elevados (la validación se realizó en contenedores compatibles con Ubuntu 22.04 y una GPU de 96 GB) y un proceso de entrega que incluye verificación de hashes SHA256. No se dispone de información pública sobre arquitectura interna, número de parámetros, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo conjunto S4000 con planner, modelo de acción y modelos base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a licencias de terceros y términos incluidos en el paquete) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 75,1 GB |
| Pipeline | robotics |
| Runtime incluido | Linux x86_64, instalación en `/opt/mxi/runtime` |
| Verificación de integridad | `DELIVERY_SHA256.json` (hash proporcionado de forma independiente) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. La model card describe un "modelo conjunto S4000" que debe cargarse junto con un planner, un modelo de acción, modelos base y componentes de normalización, lo que sugiere una composición modular orientada a control robótico más que un transformer monolítico de lenguaje. No se especifica si emplea transformers, MoE, SSM o una arquitectura híbrida, pese al sufijo "Hybrid" del nombre.

Tampoco se detallan los datos de entrenamiento: la model card afirma explícitamente que "no se incluye ningún dato de entrenamiento". No hay información sobre número de tokens, composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación. La única evidencia de validación mencionada es la aceptación local descrita en `ACCEPTANCE.json` y el directorio de evidencias, con alcance limitado a comprobaciones de protocolo, un rollout de `stack_blocks` y una verificación numérica de migración.

## Capacidades

- Ejecución de políticas robóticas en simulación: el paquete está orientado a evaluación con un simulador proporcionado por el evaluador y un driver NVIDIA compatible.
- Rollout de tareas manipulativas: la model card documenta un rollout exitoso de la tarea `stack_blocks`.
- Composición modular planner + acción: requiere cargar planner, modelo de acción, modelos base y normalización de forma conjunta.
- Integración mediante adaptador XPolicyLab: el repositorio GitHub del autor incluye el adaptador y las instrucciones de uso.
- Verificación de integridad de entrega: el flujo incluye comprobación de `DELIVERY_SHA256.json` contra un hash proporcionado de forma independiente.
- Capacidades de lenguaje, visión, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de políticas de manipulación en simulador: el modelo se cargaría mediante el adaptador XPolicyLab apuntando a `model/`, dentro de un contenedor compatible con Ubuntu 22.04, para ejecutar rollouts de tareas como `stack_blocks` y comparar el comportamiento frente a la evidencia de aceptación incluida.
- Reproducción de la aceptación local: un equipo puede replicar las comprobaciones documentadas en `ACCEPTANCE.json` (protocolo, rollout y verificación numérica de migración) para validar que su entorno de simulación y driver NVIDIA producen resultados consistentes.
- Verificación de cadena de suministro de modelos: el flujo de hash SHA256 y commit fijado de HuggingFace permite integrar el artefacto en pipelines internos con control de integridad, útil en entornos donde la procedencia del modelo es un requisito.
- Investigación en robótica con composición modular: al requerir planner, acción, base y normalización conjuntos, el paquete sirve como base para estudiar cómo interactúan estos componentes en tareas de manipulación.
- Desarrollo de adaptadores de inferencia: el runtime incluido contiene la implementación de inferencia, lo que permite a ingenieros estudiar o extender la integración con XPolicyLab y otros frameworks de evaluación.
- Pruebas de migración numérica: la comprobación con observación fija repetida dos veces sirve como caso de prueba para validar portabilidad de implementaciones entre entornos.
- Evaluación comparativa interna: aunque no es una puntuación oficial de leaderboard, el artefacto puede usarse como referencia interna en experimentos de robótica, siempre que se respeten las licencias de terceros del paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la aceptación local "no es una puntuación oficial de leaderboard ni una afirmación de equivalencia general".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 75,1 GB en safetensors, por lo que la carga completa requiere al menos esa capacidad de memoria, y la validación se realizó en una GPU de 96 GB.
- GPU recomendadas: la validación usó una GPU de 96 GB (categoría A100 80 GB no bastaría según el dato de validación; H100 80 GB tampoco alcanzaría los 96 GB citados; se requiere una GPU de 96 GB o superior, como H100 NVL o H200).
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) según el tamaño del repositorio y el requisito de validación.
- Sistema operativo: contenedores compatibles con Ubuntu 22.04, Linux x86_64.
- Runtime: instalación en `/opt/mxi/runtime`; el evaluador debe aportar el simulador y un driver NVIDIA compatible.
- Opciones de despliegue: runtime propietario incluido en el paquete; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (robótica, pipeline `robotics`) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Alcance de validación muy limitado: una comprobación de protocolo, un único rollout de `stack_blocks` y una verificación numérica repetida dos veces; no equivale a una evaluación general.
- No es una puntuación oficial de leaderboard ni una afirmación de equivalencia con otros modelos.
- Licencia no disponible: la model card remite a licencias de terceros y términos incluidos en el paquete; es imprescindible revisarlos antes de cualquier uso comercial.
- El repositorio de código MXI sigue con acceso controlado para la entrega oficial; el runtime incluye necesariamente la implementación de inferencia, lo que limita la auditabilidad del código fuente.
- Requiere cargar planner, acción, base y normalización juntos; usar la raíz del repositorio o un fichero de acción aislado como checkpoint no es válido.
- Requisitos de hardware elevados: GPU de 96 GB en la validación, contenedores Ubuntu 22.04 y driver NVIDIA compatible aportado por el evaluador.
- No se incluyen datos de entrenamiento, lo que impide auditar sesgos, composición del dataset o riesgo de alucinación en el sentido habitual de modelos de lenguaje.
- El nombre `PRIVATE_DELIVERY.txt` y el lenguaje de acceso privado en los registros de aceptación describen la etapa original de empaquetado; el autor aclara que la descarga pública está autorizada, pero conviene fijar un commit de HuggingFace y verificar el hash SHA256 antes de instalar o ejecutar el runtime.
- No hay información sobre idiomas soportados, sesgos conocidos, limitaciones de contexto ni comportamiento fuera del simulador.

## Enlaces

- HuggingFace: https://huggingface.co/D-URing/mxi_Hybrid_v0_preview
- Repositorio GitHub (código canónico y adaptador XPolicyLab): https://github.com/D-URing/MXI
