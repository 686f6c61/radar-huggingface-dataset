# abbuibuibui/YukoYoshida-Lora

## Resumen

YukoYoshida-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Yuko Yoshida (吉田优子), protagonista del anime *The Demon Girl Next Door* (*Machikado Mazoku*). No es un modelo de lenguaje: es un adaptador de bajo rango que se acopla a un modelo base SDXL para generar imagenes del personaje con consistencia de identidad y vestuario.

El adaptador se distribuye como siete checkpoints correspondientes a las epocas E1-E7 del entrenamiento, con un tamano de 456.498.604 bytes por fichero (aproximadamente 435 MiB en safetensors). El autor recomienda E6 a fuerza 0.8 tras una evaluacion comparativa propia en tres rondas sobre escenas y fuerzas distintas. El modelo base no se incluye en el repositorio; hay que descargarlo por separado.

Su relevancia es acotada: se trata de un LoRA de personaje de nicho, sin descargas ni likes en el momento de la consulta, orientado a la generacion de ilustracion anime con el ecosistema Illustrious. El interes tecnico esta en la documentacion del proceso de seleccion de epoca y en el etiquetado por tokens de vestuario, mas que en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusion latente SDXL; base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango 64, alpha 32; no se publica el numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion de entrenamiento con buckets de hasta 1536) |
| Tipos de cuantizacion | no disponible; pesos en safetensors, compatible con carga fp16/bf16 segun el pipeline |
| Idiomas soportados | en, zh (etiquetas de metadatos y documentacion; los prompts de imagen funcionan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (un fichero por epoca) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 inyectado en las capas de atencion del UNet de SDXL, segun la convencion habitual en el ecosistema diffusers. El modelo base es waiIllustriousSDXL v17, un checkpoint SDXL afinado para ilustracion anime. El entrenamiento uso AdamW en bf16, buckets con tope de 1536 y siete epocas sobre un dataset de 118 pares imagen-texto que cubren siete conjuntos de vestuario, con tres repeticiones por muestra.

Las leyendas se generaron con `keep_tokens = 2` y omiten con frecuencia el color de pelo y de ojos, de modo que el autor indica que conviene anadir esos descriptores en el prompt. La identidad se activa con el token `yuko_yoshida`; el vestuario se controla con tokens especificos (`yuko_yoshida_school_uniform`, `yuko_yoshida_crisis_management_form`, entre otros). No se documenta uso de RLHF, DPO ni tecnicas de destilacion; es un ajuste supervisado clasico de LoRA de personaje.

## Capacidades

- Generacion de imagenes de un unico personaje anime con identidad estable: pelo largo castano y ojos castanos.
- Control de vestuario mediante tokens dedicados: uniforme escolar, forma de gestion de crisis (demonio), camiseta de tirantes azul, uniforme de gimnasia, casual azul claro, top de cuadros rosa y sudadera de rayas rosa.
- Composicion de escenas variadas: retrato frontal, tres cuartos, perfil, cuerpo entero, personaje sentado, fondos simples y fondos complejos nocturnos.
- Funcionamiento sin token de vestuario (el modelo infiere una apariencia por defecto, documentada en la muestra `05_no_outfit`).
- Integracion con el ecosistema diffusers y ComfyUI; el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o video.

## Casos de uso

- Ilustracion de fan art: generar imagenes del personaje en poses y escenas nuevas usando `yuko_yoshida` junto con tokens de vestuario, con la fuerza recomendada de 0.8 para preservar el parecido.
- Creacion de fichas de personaje consistentes: producir un conjunto de retratos (frontal, tres cuartos, perfil) con el mismo LoRA y semilla controlada para documentar el diseno del personaje.
- Prototipado de assets para proyectos derivados no comerciales: generar bocetos de escenas con el uniforme escolar o la forma demoniaca antes de encargar ilustracion final.
- Experimentacion con pipelines SDXL: usar los siete checkpoints como caso de estudio de seleccion de epoca y barrido de fuerza (0.4, 0.6, 0.8, 1.0) en un flujo ComfyUI.
- Generacion de variantes de vestuario: aprovechar los tokens secundarios (gym uniform, hoodie, plaid top) para ilustrar al personaje en contextos cotidianos fuera del uniforme.
- Benchmarking interno de LoRAs de personaje: comparar E5, E6 y E7 sobre el mismo conjunto de prompts y semillas para medir deriva de identidad y fidelidad de vestuario.
- Docencia sobre ajuste fino de difusion: el repositorio incluye la configuracion de entrenamiento y las evaluaciones, utiles como ejemplo practico de LoRA de personaje en SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor aporta una evaluacion cualitativa en tres rondas:

| Ronda | Candidatos | Condiciones | Conclusion |
|---|---|---|---|
| Round 1 | E1-E7 | Fuerza 0.8 | Seleccion inicial de epocas viables |
| Round 3 | E5, E6, E7 | 10 escenas x 4 fuerzas (0.4, 0.6, 0.8, 1.0) | E6 recomendada a 0.8; E5 y E7 como alternativas |

| Candidato | Observacion del autor | Decision |
|---|---|---|
| E5 | Pelo castano largo y ojos castanos usables; uniforme escolar a menudo presente | Alternativa |
| E6 | Retrato con silueta estable de Yuko: pelo castano largo, ojos castanos, uniforme escolar | Recomendada a 0.8 |
| E7 | Muy proxima a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada: el LoRA pesa unos 435 MiB por fichero; el consumo dominante es el del modelo base SDXL, que en fp16 ronda los 6-8 GB y en fp32 mas de 12 GB. No se publican mediciones propias.
- GPU recomendadas: no hay datos especificos del autor. Por el tamano del base SDXL, son adecuadas GPU consumer de 8 GB o mas (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) y GPU de datacenter (A100, H100) para lotes grandes.
- Cabe en GPU consumer: si, siempre que el checkpoint base SDXL quepa en VRAM; el LoRA anade una sobrecarga pequena.
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI (usado por el autor en las muestras), y en general cualquier frontend compatible con LoRA SDXL.
- Latencia y throughput: no disponibles. La configuracion de referencia del autor es Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y 832x1216, sin hires fix ni ADetailer.

## Comparativa con modelos similares

No se dispone de datos de otros LoRAs de personaje comparables en la informacion proporcionada. La comparacion se limita al propio modelo base y a sus epocas:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YukoYoshida-Lora (E6) | LoRA SDXL de personaje | no disponible (rango 64) | no aplica | creativeml-openrail-m | HuggingFace y ModelScope |
| waiIllustriousSDXL v17 | Checkpoint SDXL base | no disponible | no aplica | no disponible en esta ficha | Requiere descarga aparte |
| Otros LoRAs de personaje Illustrious | LoRA SDXL | no disponible | no aplica | variable | no disponible |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares; el autor lo declara como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en la licencia) y no garantiza libertad comercial plena; conviene revisar sus terminos antes de cualquier uso en produccion.
- Riesgo de sobreajuste al estilo del checkpoint base waiIllustriousSDXL; fuera de ese ecosistema el parecido puede degradarse.
- El etiquetado omite a menudo color de pelo y ojos: es necesario anadir esos descriptores en el prompt para evitar deriva de identidad.
- La fuerza recomendada (0.8) es una eleccion cualitativa del autor, no validada con metricas objetivas; por encima de 1.0 puede aparecer rigidez o artefactos.
- No hay descargas ni validacion de la comunidad en el momento de la consulta; el soporte y el mantenimiento no estan garantizados.
- Solo se documentan prompts en ingles; el soporte de zh se refiere a la documentacion, no a la calidad de generacion con prompts en chino.
- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento, y no admite tool calling ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/abbuibuibui/YukoYoshida-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/YukoYoshida-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/YukoYoshida-Dataset
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` en el repositorio
- README en chino: `README_zh.md` en el repositorio
