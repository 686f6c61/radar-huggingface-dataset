# fjolsvin/Qwen3.6-35B-A3B-Esper3.1-tiiny

## Resumen

Esper 3.1 es un ajuste fino (fine-tune) del modelo Qwen3.6-35B-A3B de Alibaba, especializado en programación, arquitectura de software y operaciones DevOps. Lo desarrolla Valiant Labs, y esta versión concreta (`fjolsvin/Qwen3.6-35B-A3B-Esper3.1-tiiny`) es un reempaquetado del original `ValiantLabs/Qwen3.6-35B-A3B-Esper3.1` realizado con la herramienta tiiny-forge para que la plataforma Tiiny Pocket acepte la importación desde Hugging Face. Los pesos son idénticos al modelo original; solo se sustituyó el `config.json` por el del modelo base para que el esquema de transformers fuese compatible.

El modelo parte de una arquitectura MoE (mixture of experts) de Qwen con 35.951.822.704 parámetros totales y 3B activos por token, lo que permite inferencia rápida en servidor y ejecución local en equipos de escritorio. El entrenamiento se centró en tres frentes: datos de alta dificultad de DevOps y arquitectura generados con DeepSeek-V3.1-Terminus, datasets de razonamiento de código generados con DeepSeek-V3.1-Terminus y DeepSeek-V3.2, y datos de experiencia en IA generados con DeepSeek-R1-0528.

La relevancia actual del modelo radica en su orientación práctica hacia tareas de ingeniería: Terraform, Ansible, Kubernetes, Helm, Jenkins, Docker, observabilidad (Grafana, Prometheus), scripting en shell y PowerShell, y despliegues en Azure, AWS y GCP. Mantiene el modo de razonamiento (thinking mode) del modelo base y hereda su pipeline multimodal `image-text-to-text`, aunque la model card no detalla capacidades de visión específicas del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision original) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de 35.951.822.704 parámetros totales y aproximadamente 3B activos por token. Esta configuración permite un coste de cómputo por token similar al de un modelo denso de 3B, manteniendo la capacidad representacional de un modelo mucho mayor. El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base incorpora un codificador visual, aunque la model card del ajuste no aporta detalles sobre el entrenamiento multimodal.

El ajuste se realizó sobre cuatro datasets publicados por sequelbox: `Titanium3-DeepSeek-V3.1-Terminus` (datos de alta dificultad de DevOps y arquitectura), `Tachibana3-Part1-DeepSeek-V3.1-Terminus` y `Tachibana3-Part2-DeepSeek-V3.2` (razonamiento de código desafiante) y `Mitakihara-DeepSeek-R1-0528` (experiencia en IA, MLOps, arquitectura de IA e investigación). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El prompt format es el de Qwen3.6-35B-A3B, con soporte para modo thinking mediante `enable_thinking=True` y el token especial `</think>` (id 248069).

## Capacidades

- Generación de texto y razonamiento general con modo thinking activable o desactivable.
- Programación en Python, JavaScript, shell, bash y PowerShell.
- DevOps: Jenkins, Terraform, Ansible, Docker, Kubernetes, Helm.
- Observabilidad: configuración de Grafana y Prometheus.
- Cloud: despliegues y configuración en Azure, AWS y GCP.
- Arquitectura de software y diseño de sistemas.
- MLOps, arquitectura de IA e investigación aplicada en IA.
- Razonamiento multi-paso y resolución de problemas de ingeniería.
- Conversación multi-turno en formato chat/instruct.
- Capacidad multimodal declarada por el pipeline (`image-text-to-text`), si bien no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- **Infraestructura como código con Terraform**: el modelo puede generar configuraciones completas con data sources dinámicos (por ejemplo, `aws_ami` para localizar la última AMI de Amazon Linux 2) y aprovisionar instancias EC2, tal como se muestra en el ejemplo oficial de la model card.
- **Automatización de pipelines CI/CD con Jenkins**: generación y revisión de Jenkinsfiles, etapas de build/test/deploy y gestión de credenciales, aprovechando los datos de entrenamiento específicos de Jenkins.
- **Orquestación de contenedores**: redacción de manifiestos de Kubernetes, charts de Helm y Dockerfiles multi-stage, con razonamiento sobre dependencias entre servicios.
- **Gestión de configuración con Ansible**: creación de playbooks y roles idempotentes para aprovisionamiento de servidores y despliegue de aplicaciones.
- **Observabilidad y monitorización**: definición de dashboards de Grafana, reglas de alerta de Prometheus y consultas PromQL para métricas de infraestructura.
- **Scripting multiplataforma**: generación de scripts en bash, shell y PowerShell para tareas de administración de sistemas en entornos Linux y Windows.
- **Arquitectura cloud multi-proveedor**: diseño de topologías en AWS, Azure y GCP, con comparación de servicios equivalentes y estimación de costes.
- **Asistencia en MLOps**: diseño de pipelines de entrenamiento, despliegue de modelos y monitorización de drift, apoyado en el dataset de experiencia en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 72 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un nodo con al menos 80 GB.
- GPU recomendadas para precisión completa: A100 80GB, H100 80GB, o múltiples GPU de 24-48 GB con tensor parallelism.
- Al ser un MoE con ~3B parámetros activos, el throughput por token es notablemente superior al de un denso de 36B, aunque el requisito de memoria viene dominado por los parámetros totales.
- En GPU de consumo: no cabe en una RTX 4090 (24 GB) en precisión original; requeriría cuantización a 4 bits (no publicada en este repo) para aproximarse a los ~18-20 GB.
- Opciones de despliegue: transformers (soporte nativo declarado), y por compatibilidad con el modelo base cabría esperar vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| fjolsvin/Qwen3.6-35B-A3B-Esper3.1-tiiny | 35,95B totales / ~3B activos | no disponible | apache-2.0 | DevOps, arquitectura, código |
| ValiantLabs/Qwen3.6-35B-A3B-Esper3.1 | 35,95B totales / ~3B activos | no disponible | apache-2.0 | DevOps, arquitectura, código (original) |
| Qwen/Qwen3.6-35B-A3B | 35,95B totales / ~3B activos | no disponible | no disponible en la información | Modelo base generalista |
| ValiantLabs/Qwen3.6-27B-Esper3.1 | 27B (denso, presumiblemente) | no disponible | apache-2.0 | DevOps, arquitectura, código |

La diferencia principal frente al original de ValiantLabs es únicamente el reempaquetado del `config.json`; los pesos son idénticos. Frente al modelo base Qwen, Esper 3.1 añade especialización en DevOps y arquitectura a costa de posible regresión en tareas generales no cubiertas por los datasets de ajuste.

## Limitaciones y advertencias

- El modelo está declarado únicamente para inglés (`en`); el rendimiento en castellano no está garantizado ni documentado.
- Al ser un fine-tune especializado, puede presentar regresión en capacidades generales respecto al Qwen3.6-35B-A3B original.
- Riesgo de alucinación en configuraciones de infraestructura: los ejemplos de Terraform, Kubernetes o Ansible generados deben revisarse antes de aplicarse en producción.
- No se documentan sesgos conocidos, pero al entrenarse sobre datos sintéticos generados por DeepSeek-V3.1-Terminus, V3.2 y R1-0528, puede heredar sesgos de esos generadores.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, que no se detallan en la información proporcionada.
- El repo ocupa 71,9 GB y no incluye cuantizaciones GGUF ni AWQ/GPTQ; desplegarlo requiere hardware de gama alta o conversión manual.
- El modelo fue creado y actualizado el 17 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria todavía.
- La longitud de contexto no está especificada en la model card; no debe asumirse la del modelo base sin verificación.

## Enlaces

- [Hugging Face: fjolsvin/Qwen3.6-35B-A3B-Esper3.1-tiiny](https://huggingface.co/fjolsvin/Qwen3.6-35B-A3B-Esper3.1-tiiny)
- [Modelo original: ValiantLabs/Qwen3.6-35B-A3B-Esper3.1](https://huggingface.co/ValiantLabs/Qwen3.6-35B-A3B-Esper3.1)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Dataset: sequelbox/Titanium3-DeepSeek-V3.1-Terminus](https://huggingface.co/datasets/sequelbox/Titanium3-DeepSeek-V3.1-Terminus)
- [Dataset: sequelbox/Tachibana3-Part1-DeepSeek-V3.1-Terminus](https://huggingface.co/datasets/sequelbox/Tachibana3-Part1-DeepSeek-V3.1-Terminus)
- [Dataset: sequelbox/Tachibana3-Part2-DeepSeek-V3.2](https://huggingface.co/datasets/sequelbox/Tachibana3-Part2-DeepSeek-V3.2)
- [Dataset: sequelbox/Mitakihara-DeepSeek-R1-0528](https://huggingface.co/datasets/sequelbox/Mitakihara-DeepSeek-R1-0528)
- [Valiant Labs](http://valiantlabs.ca/)
- [Hugging Face: ValiantLabs](https://huggingface.co/ValiantLabs)
- [Space de apoyo: sequelbox/SupportOpenSource](https://huggingface.co/spaces/sequelbox/SupportOpenSource)
