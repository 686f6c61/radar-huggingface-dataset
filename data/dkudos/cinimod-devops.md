# dkudos/cinimod-devops

## Resumen

Cinimod DevOps 1.5B es un modelo de lenguaje generativo entrenado desde cero por Dominic Kaiser (dkudos) para responder preguntas técnicas sobre DevOps e infraestructura cloud. Se basa en una arquitectura estilo Llama-3 con atención de consultas agrupadas (GQA), 24 capas y un tamaño oculto de 1.536, y está orientado a dominios como Kubernetes, Terraform, AWS, Docker, CI/CD, Linux, monitorización y seguridad. Aunque el autor lo presenta como un modelo de 1.5B con ~781M parámetros activos, los pesos reales en safetensors suman 695.281.152 parámetros. Su contexto de entrenamiento es de 1.024 tokens, con una extrapolación teórica hasta ~256K gracias a RoPE theta 500.000, aunque la calidad puede degradarse. Es un modelo base sin ajuste por instrucciones, pensado para ser usado como asistente técnico o como punto de partida para fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (custom) |
| Parámetros totales | 695.281.152 (safetensors) |
| Longitud de contexto | 1.024 tokens (entrenamiento); extrapolación hasta ~256K según el autor |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Hidden size | 1.536 |
| Capas | 24 |
| Cabezas de atención | 24 (Q) / 6 (KV) - GQA |
| Tamaño intermedio | 4.096 |
| Tamaño de vocabulario | 65.536 (BPE) |
| RoPE theta | 500.000 |
| Dtype de entrenamiento | FP32 |
| Dtype de inferencia | FP16 |
| Tokenizer | BPE personalizado, 65K |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura LlamaForCausalLM personalizada, con 24 capas, tamaño oculto de 1.536, 24 cabezas de consulta (Q) y 6 de clave/valor (KV) mediante GQA, tamaño intermedio de 4.096 y vocabulario BPE de 65.536 tokens. Los embeddings de palabras están atados para reducir parámetros y se activa gradient checkpointing para eficiencia de memoria. El entrenamiento se realizó en FP32 con DeepSpeed ZeRO-2, sobre un corpus de ~50 GB de datos DevOps (subconjunto de FineWeb-Edu, repositorios de GitHub de DevOps y documentación de proveedores cloud). Se ejecutaron 60.423 pasos con tamaño de lote efectivo de 8, tasa de aprendizaje máxima de 3e-4 con decaimiento coseno y longitud de secuencia de 1.024. Se usaron 2 GPUs Tesla V100 de 16 GB durante aproximadamente 6 días. El autor señala que no se aplicó escalado RoPE, ya que el escalado lineal anterior (factor 256) rompía el codificador posicional durante el entrenamiento.

## Capacidades

- Generación de texto técnico en inglés sobre Kubernetes: Pods, Deployments, StatefulSets, Services, Ingress, networking, storage, RBAC, Helm, operators y troubleshooting.
- Terraform: IaC, gestión de estado, módulos, providers, workspaces, import y buenas prácticas.
- AWS: EC2, S3, VPC, RDS, EKS, Lambda, IAM, CloudWatch y optimización de costes.
- Docker: imágenes, contenedores, volúmenes, networking, Compose, builds multi-stage y Swarm.
- CI/CD: GitHub Actions, Jenkins, GitLab CI, ArgoCD, estrategias de despliegue y pipelines.
- Linux: administración del sistema, networking, seguridad, monitorización de rendimiento y systemd.
- Monitorización: Prometheus, Grafana, Alertmanager, Loki, Elasticsearch y tracing distribuido.
- Seguridad: zero trust, escaneo de vulnerabilidades, respuesta a incidentes y pentesting.
- Networking: DNS, balanceo de carga, CDN, SSL/TLS y troubleshooting.
- No se documenta soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistente para administración de Kubernetes: el modelo puede generar explicaciones y snippets de manifiestos YAML para Deployments, Services o Ingress. Su entrenamiento en documentación de Kubernetes le permite responder dudas frecuentes, aunque al ser un modelo base conviene verificar la sintaxis.
- Generación de configuraciones Terraform: ayuda a redactar bloques de recursos, módulos y providers de AWS. Adecuado para prototipos rápidos, pero requiere revisión manual antes de aplicar en producción.
- Documentación técnica de infraestructura AWS: puede redactar descripciones de arquitecturas con EC2, S3, VPC o IAM, útil para equipos que necesitan documentar entornos cloud.
- Soporte en pipelines CI/CD: el modelo puede generar configuraciones de GitHub Actions, GitLab CI o Jenkins, así como explicar estrategias de despliegue como blue-green o canary. Su conocimiento de CI/CD permite acelerar la creación de pipelines.
- Administración de Linux y troubleshooting: responde preguntas sobre systemd, gestión de usuarios, permisos, red y monitorización de rendimiento. Es útil como segundo nivel de soporte para administradores de sistemas.
- Monitorización y observabilidad: genera consultas para Prometheus, configuraciones de Grafana o reglas de Alertmanager, y explica conceptos de tracing distribuido. Adecuado para documentar dashboards y alarmas.
- Seguridad y cumplimiento: puede describir principios de zero trust, escaneo de vulnerabilidades y respuesta a incidentes. Sirve como material de formación para equipos de seguridad.
- Formación interna en DevOps: el modelo puede generar explicaciones pedagógicas sobre conceptos de infraestructura como código, contenedores u orquestación, útil para onboarding de nuevos desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con FP16, los pesos ocupan ~1,4 GB; con FP32, ~2,8 GB. Sumando overhead de activaciones y KV cache, se recomienda al menos 4 GB de VRAM para inferencia básica.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) o GPUs de datacenter como A100 o H100.
- Cabe en GPUs consumer de gama media.
- Opciones de despliegue: transformers (con trust_remote_code), script serve_model.py compatible con OpenAI, text-generation-inference (según tags). También puede adaptarse a vLLM o llama.cpp mediante conversión, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa directa con modelos similares. El modelo CodeFuse-DevOps-Model aparece en resultados de búsqueda, pero no se proporcionan especificaciones comparables.

## Limitaciones y advertencias

- Contexto de entrenamiento limitado a 1.024 tokens; la extrapolación a 256K puede degradar la calidad y no está garantizada.
- Modelo base sin ajuste por instrucciones (no instruction tuning). Puede no seguir prompts de chat de forma fiable.
- Riesgo de alucinación en detalles técnicos específicos, versiones de APIs o temas nicho.
- No ejecuta código ni verifica soluciones; siempre hay que probar en un entorno seguro.
- Corpus de entrenamiento de ~50 GB, reducido en comparación con modelos frontera.
- Tamaño pequeño (695M-781M) limita el razonamiento complejo y la coherencia a largo plazo.
- Solo soporta inglés (tag "en").
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar configuraciones antes de aplicarlas en producción.

## Enlaces

- HuggingFace: https://huggingface.co/dkudos/cinimod-devops
