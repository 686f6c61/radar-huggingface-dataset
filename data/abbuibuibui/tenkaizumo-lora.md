# abbuibuibui/TenkaIzumo-Lora

## Resumen

TenkaIzumo-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint waiIllustriousSDXL v17. Reproduce a Tenka Izumo (出云天花), personaje de la serie *Mato Seihei no Slave*, con dos conjuntos de vestuario diferenciados: uniforme de combate y jersey de cuello alto morado. El repositorio incluye siete checkpoints intermedios (E1-E7) y documentacion de evaluacion comparativa entre ellos.

El modelo resuelve un problema acotado: la generacion consistente de un personaje concreto en un pipeline de difusion texto-a-imagen, manteniendo rasgos estables (pelo negro largo, ojos morados) y variantes de vestuario controlables mediante tokens especificos. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (rank 64, alpha 32) que se carga sobre un checkpoint base y modifica su comportamiento en inferencia.

Es relevante en el ecosistema de generacion de imagenes anime porque el autor publica un proceso de seleccion de epoch documentado (matriz de evaluacion E5-E7 por 10 escenas y 4 intensidades), algo poco habitual en LoRAs de personaje, y porque fija un checkpoint recomendado (E6 a fuerza 0.8) con hash SHA-256 verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusion SDXL; base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (cada fichero pesa 456.493.564 bytes; rank 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion de entrenamiento con buckets hasta 1536) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del runtime del checkpoint base) |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (ficheros individuales por epoch) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 inyectado sobre waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustracion anime. El entrenamiento uso AdamW en bf16, buckets con tope de 1536 y 7 epochs. El dataset consta de 69 pares de imagenes agrupados en tres conjuntos de vestuario (Combat_Uniform, Purple_Turtleneck, Teal_Sleeveless_Blouse) con repeticion 2. Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y ojos a menudo se omita en las descripciones y deba anadirse manualmente en el prompt.

La innovacion tecnica principal no esta en la arquitectura sino en el protocolo de seleccion: el autor realizo una ronda de cribado de E1-E7 a fuerza 0.8 y una matriz comparativa de E5, E6 y E7 cruzada con 10 escenas y 4 intensidades (0.4, 0.6, 0.8, 1.0), publicando las imagenes resultantes. El entrenamiento se ejecuto en NVIDIA DGX Spark con ComfyUI. Se distinguen tres tokens: `tenka_izumo` (identidad), `tenka_izumo_combat_uniform` y `tenka_izumo_purple_turtleneck` (vestuario).

## Capacidades

- Generacion de imagenes de un personaje concreto (Tenka Izumo) sobre SDXL, con identidad estable mediante el token `tenka_izumo`.
- Control de vestuario mediante tokens dedicados: uniforme de combate (pantalon, botas hasta la rodilla, guantes blancos, charreteras doradas, ribete en V rojo) y jersey de cuello alto morado con pantalon negro y tacones.
- Transferencia de estilo y composicion del checkpoint base waiIllustriousSDXL v17, incluida estetica anime y encuadres de retrato, tres cuartos y perfil.
- Funcionamiento en escenas simples y complejas (fondo nocturno, calle, fondo neutro) segun la matriz de evaluacion publicada.
- Compatibilidad con prompts en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o video: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: usar `tenka_izumo` junto con el token de vestuario en ComfyUI con Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216 para obtener retratos coherentes del personaje sin reentrenar.
- Creacion de hojas de personaje: generar vistas frontal, tres cuartos y perfil con el mismo seed y fuerza 0.8 para documentar el diseno de forma reproducible.
- Prototipado de escenas para doujinshi o comic amateur: combinar el LoRA con prompts de fondo nocturno o calle para producir paneles de referencia antes del entintado manual.
- Pruebas de pipeline de difusion: servir como caso de prueba controlado para validar flujos de ComfyUI, gestion de LoRAs y caching de checkpoints en entornos de investigacion.
- Comparacion de intensidades de LoRA: el rango documentado de 0.4 a 1.0 permite estudiar el efecto de la fuerza del adaptador sobre identidad y composicion en un personaje fijo.
- Generacion de material promocional no oficial para comunidades de la serie: banners, avatares y portadas para foros, sujeto a los terminos de la licencia CreativeML OpenRAIL-M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor publica unicamente una evaluacion cualitativa comparativa:

| Candidato | Observacion documentada | Decision |
|---|---|---|
| E5 | Pelo negro largo y ojos morados usables | Alternativo |
| E6 | Retrato con pelo negro largo, ojos morados, charreteras doradas y ribete en V rojo; cuerpo completo con pantalon, botas hasta la rodilla y guantes blancos | Recomendado a 0.8 |
| E7 | Cercano a E6 | Alternativo final |

Ajustes de inferencia del showcase: ComfyUI, Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires fix ni ADetailer.

## Requisitos de hardware

- VRAM: el LoRA en si ocupa unos 456 MB por fichero; el consumo real lo determina el checkpoint base SDXL. En fp16, SDXL requiere del orden de 8-12 GB de VRAM para inferencia a 1024 px; con cuantizacion del base puede bajar a 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para lotes grandes y alta resolucion; el autor entreno en NVIDIA DGX Spark.
- GPU de consumo: cabe en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) usando el checkpoint base en fp16 o cuantizado; con 6 GB es posible a resoluciones reducidas.
- Despliegue: ComfyUI (entorno usado por el autor), Automatic1111/Forge, Diffusers (el repo declara `library_name: diffusers`), o runtimes que carguen safetensors de LoRA sobre SDXL.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TenkaIzumo-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | rank 64 / alpha 32 | no aplica | creativeml-openrail-m | HuggingFace y ModelScope |
| LoRA de personaje generico en Illustrious | LoRA de personaje | checkpoints Illustrious | variable | no aplica | variable | Civitai, HuggingFace |
| LoRA de personaje en Pony Diffusion | LoRA de personaje | Pony Diffusion V6 XL | variable | no aplica | variable | Civitai, HuggingFace |
| Checkpoint SDXL completo | Modelo base | SDXL | ~2.600 M (UNet) | no aplica | CreativeML OpenRAIL++-M | HuggingFace, Stability |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares; el autor lo declara explicitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en el anexo) y exige mantener el aviso de licencia; conviene revisar los terminos antes de uso comercial.
- El dataset es pequeno (69 pares de imagenes), lo que limita la variedad de poses, angulos y expresiones; el autor documenta problemas de consistencia en algunas vistas.
- Las captions omiten con frecuencia color de pelo y ojos: si no se anaden manualmente (`long black hair, purple eyes`), la identidad puede desviarse.
- El checkpoint base waiIllustriousSDXL v17 tiene su propia licencia y limitaciones, que se heredan al usar el LoRA.
- Riesgo de sobreajuste al estilo del checkpoint base y de artefactos en composiciones complejas; el autor no publica metricas cuantitativas de calidad.
- Fuerza recomendada 0.8; por encima de 1.0 puede degradar la composicion y por debajo de 0.4 la identidad se pierde.
- No apto para tareas de texto, razonamiento o codigo: es exclusivamente un adaptador de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/TenkaIzumo-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/TenkaIzumo-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/TenkaIzumo-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/TenkaIzumo-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` dentro del repositorio
