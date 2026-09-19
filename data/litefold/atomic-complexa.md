# LiteFold/atomic-complexa

## Resumen

LiteFold/atomic-complexa es un espejo (mirror) de los seis ficheros de checkpoint de inferencia publicados por NVIDIA para Proteina-Complexa 160M v1, un sistema generativo de diseno biomolecular. No se trata de un modelo nuevo ni de un fine-tuning: el autor declara que los ficheros son copias byte a byte de los pesos oficiales, conservan los nombres originales y no han sido convertidos, fragmentados ni modificados. Atomic actua como puente de ejecucion nativa y selecciona automaticamente un par emparejado de modelo de flujo (flow model) y autoencoder para cada una de las tres variantes disponibles.

El repositorio cubre tres tareas de diseno: diseno de binders frente a dianas proteicas (`protein`), diseno de binders frente a ligandos (`ligand`) y andamiaje de motivos con la variante AME (`ame`). Cada variante se corresponde con un modelo oficial de NVIDIA con 160M de parametros, publicado bajo la NVIDIA Open Model License, con revisiones upstream concretas documentadas en la model card. El tamano del repositorio es de 18,8 GB, lo que da una media de aproximadamente 3,1 GB por fichero de checkpoint, muy por encima de lo que ocuparian los pesos puros de un modelo de 160M de parametros, lo que sugiere que los `.ckpt` incluyen estado adicional (por ejemplo, del autoencoder emparejado o de estados auxiliares).

Su relevancia es practica para equipos de biologia computacional que necesitan reproducibilidad y despliegue en entornos controlados: el mirror incluye `SHA256SUMS` para verificar la integridad frente a los digests LFS oficiales, la licencia completa y el aviso de atribucion. Es, por tanto, una pieza de infraestructura de distribucion de pesos, no un modelo con benchmarks propios publicados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo generativo basado en flow matching emparejado con un autoencoder (par flow-model + autoencoder por variante; no es un transformer de lenguaje) |
| Parametros totales | 160M por variante (segun la denominacion oficial "160M v1"); no disponible el desglose por submodulo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints PyTorch sin cuantizar) |
| Idiomas soportados | no disponible / no aplica (modelo de diseno de estructuras biomoleculares, no textual) |
| Licencia | NVIDIA Open Model License (`license: other`, `license_name: nvidia-open-model-license`) |
| Formato de pesos | PyTorch `.ckpt` (`complexa.ckpt`, `complexa_ae.ckpt` y equivalentes por variante) |
| Variantes incluidas | protein binder, ligand binder, AME motif scaffolding |
| Ficheros de checkpoint | 6 en total (2 por variante: modelo de flujo + autoencoder) |
| Tamano del repositorio | 18,8 GB |
| Framework declarado | PyTorch |
| Runtime requerido | Proteina-Complexa / BioNeMo (no incluido; instalacion y configuracion aparte) |
| Verificacion de integridad | `SHA256SUMS` generado tras la descarga del mirror |
| Fecha de creacion en el Hub | 2026-09-19 |
| Fecha de actualizacion en el Hub | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe la arquitectura como un par emparejado de modelo de flujo (flow model) y autoencoder, seleccionado automaticamente por Atomic para cada backend (`protein`, `ligand`, `ame`). La model card no detalla el numero de capas, la dimension del espacio latente, el tipo de atencion ni el esquema de condicionamiento; tampoco especifica si el modelo de flujo opera en espacio de coordenadas atomicas o en un espacio latente comprimido por el autoencoder. La unica cifra de escala confirmada es la denominacion oficial de 160M de parametros por variante.

No se proporcionan datos de entrenamiento: ni numero de tokens o estructuras, ni composicion del dataset, ni si hubo etapas de refinamiento tipo RLHF/DPO (conceptos que, ademas, no aplican de forma directa a un modelo generativo de estructuras). Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, muestreo acelerado) ni curvas de escalado. Lo que si queda claro es que LiteFold no ha entrenado ni modificado nada: el valor del repositorio es la integridad de los pesos y la trazabilidad frente a las revisiones upstream (`ffed199e...`, `bc90c8b2...`, `9743d749...`).

## Capacidades

- Generacion de estructuras de proteinas: diseno de binders contra dianas proteicas mediante la variante `protein` (`complexa.ckpt` + `complexa_ae.ckpt`).
- Diseno de binders frente a ligandos: variante `ligand` (`complexa_ligand.ckpt` + `complexa_ligand_ae.ckpt`), orientada a moleculas pequenas como diana.
- Andamiaje de motivos (motif scaffolding): variante `ame` (`complexa_ame.ckpt` + `complexa_ame_ae.ckpt`), para construir estructuras que presenten un motivo funcional concreto.
- Seleccion automatica de backend: Atomic elige el par modelo de flujo + autoencoder coherente con la variante solicitada.
- Reconstruccion/decodificacion mediante autoencoder emparejado, necesario para pasar de la representacion generativa a estructura.
- Verificacion de integridad de pesos mediante `SHA256SUMS` frente a los digests oficiales.
- Despliegue en entornos aislados: al ser un mirror, permite operar sin depender de la disponibilidad del Hub de NVIDIA.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso agentico, razonamiento multi-paso, vision, audio, thinking mode ni soporte multilingue; no aplican a este tipo de modelo.

## Casos de uso

- Diseno de binders proteicos in silico: usar la variante `protein` para generar candidatos de union contra una diana concreta y enviar el conjunto resultante a filtrado computacional (docking, prediccion de estructura, scoring de interfaz) antes de sintetizar nada en laboratorio.
- Diseno de binders contra ligandos: la variante `ligand` permite plantear moleculas que reconozcan una molecula pequena, util en proyectos de sensores biologicos o de modulacion de rutas donde el objetivo no es una proteina.
- Andamiaje de motivos funcionales: la variante `ame` sirve para estabilizar y presentar un motivo catalitico o de union conocido dentro de un scaffold nuevo, por ejemplo al trasplantar un sitio activo a una arquitectura mas estable.
- Pipeline de diseno generativo por lotes: integrar los checkpoints en un flujo automatizado con el runtime Proteina-Complexa/BioNeMo para generar cientos de candidatos por diana, con control de versiones de pesos garantizado por el mirror y sus sumas SHA256.
- Reproducibilidad de resultados publicados: al ser copia byte a byte de revisiones upstream concretas, permite fijar exactamente la version de pesos usada en un experimento y descartar variaciones por re-descarga o conversion de formato.
- Despliegue en entornos sin acceso a Internet o con requisitos de auditoria: el repositorio incluye `LICENSE-NVIDIA-OPEN-MODEL.txt` y `NOTICE`, de modo que un equipo regulado puede distribuir y ejecutar los pesos internamente cumpliendo atribucion y trazabilidad.
- Baseline para comparativas internas: usar los 160M como punto de partida reproducible frente a otros metodos de diseno generativo o frente a variantes propias, siempre que se valide experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye metricas de exito de diseno (por ejemplo, tasa de binders validos, RMSD, ipTM/pLDDT, diversidad estructural) ni comparaciones numericas con otros metodos. Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: basandose unicamente en el recuento de parametros, un modelo de 160M ocupa aproximadamente 0,64 GB en fp32 y unos 0,32 GB en fp16/BF16; un par modelo de flujo + autoencoder se situaria del orden de 1,3 GB en fp32, sin contar activaciones ni el estado adicional que sugieren los ~3,1 GB medios por fichero `.ckpt`.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con al menos 8-16 GB de VRAM (RTX 3080/4080/4090, A10, L4, A100) deberia ser suficiente para inferencia, pero esto es una estimacion por parametros, no un requisito publicado.
- GPU de consumo: previsiblemente si, dado el tamano de 160M de parametros, aunque no hay confirmacion oficial de consumo ni de latencia.
- Almacenamiento: 18,8 GB solo para los seis checkpoints, mas el runtime de Proteina-Complexa/BioNeMo.
- Opciones de despliegue: ejecucion nativa en PyTorch a traves del runtime Proteina-Complexa/BioNeMo; no se documenta soporte de vLLM, llama.cpp, Ollama, TGI, GGUF ni ONNX (y, por el tipo de modelo, no son aplicables directamente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos de modelos alternativos en la informacion proporcionada (ni parametros, ni contexto, ni resultados, ni licencias de terceros). La unica comparacion documentada es interna, entre las tres variantes que incluye el repositorio:

| Variante | Ficheros | Origen oficial | Revision upstream |
|---|---|---|---|
| Protein binder | `complexa.ckpt`, `complexa_ae.ckpt` | `nvidia/NV-Proteina-Complexa-Protein-Target-160M-v1` | `ffed199e32612b98ffa04f4640d34d37b137fca5` |
| Ligand binder | `complexa_ligand.ckpt`, `complexa_ligand_ae.ckpt` | `nvidia/NV-Proteina-Complexa-Ligand-Target-160M-v1` | `bc90c8b2c701ceb52d5faef72600b6b5be880244` |
| AME motif scaffolding | `complexa_ame.ckpt`, `complexa_ame_ae.ckpt` | `nvidia/NV-Proteina-Complexa-AME-160M-v1` | `9743d749a8754080a32fda857d95579dfa4dabae` |

Las tres comparten licencia, framework y escala (160M), y difieren en la tarea y en la diana (proteina, ligando, motivo). Para alternativas externas de la misma categoria, consultese la literatura especifica; no hay datos en esta ficha.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no soporta prompts en lenguaje natural en el sentido habitual.
- No incluye runtime: la model card indica explicitamente que hay que instalar y configurar aparte el entorno Proteina-Complexa/BioNeMo antes de generar estructuras. Los checkpoints por si solos no son ejecutables de forma trivial.
- Restricciones de licencia: los pesos se rigen por la NVIDIA Open Model License. La redistribucion exige incluir el acuerdo completo y el aviso de atribucion exacto (presentes como `LICENSE-NVIDIA-OPEN-MODEL.txt` y `NOTICE`), y el uso debe cumplir ademas los terminos de Trustworthy AI de NVIDIA y la legislacion aplicable. Revisar antes de cualquier uso comercial.
- El repositorio no es el origen: LiteFold solo aporta el mirror y el puente de ejecucion nativa. La model card upstream forma parte de la distribucion de origen y es la referencia autoritativa.
- Validacion experimental obligatoria: cualquier estructura generada es una hipotesis computacional. Un modelo generativo de este tipo puede producir disenos plausibles pero no funcionales (agregacion, inestabilidad, falta de afinidad); no hay metricas publicadas aqui que cuantifiquen esa tasa de fallo.
- Sesgos de datos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo hacia pliegues sobrerrepresentados en las bases de datos estructurales publicas ni la cobertura de familias proteicas poco caracterizadas.
- Riesgo de uso indebido: como toda herramienta de diseno biomolecular, su uso esta sujeto a las clausulas de uso aceptable de NVIDIA; los equipos deben aplicar sus propios controles de bioseguridad.
- Idiomas: no aplica, pero conviene senalar que no hay soporte multilingue ni localizacion que configurar.
- Trazabilidad: verificar `SHA256SUMS` contra los digests LFS oficiales antes de usar los pesos; si no coincide, la copia no debe considerarse equivalente al original.
- Sin senal de adopcion: 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LiteFold/atomic-complexa
- Model card oficial (protein binder): https://huggingface.co/nvidia/NV-Proteina-Complexa-Protein-Target-160M-v1
- Model card oficial (ligand binder): https://huggingface.co/nvidia/NV-Proteina-Complexa-Ligand-Target-160M-v1
- Model card oficial (AME motif scaffolding): https://huggingface.co/nvidia/NV-Proteina-Complexa-AME-160M-v1
- Ficheros de licencia y atribucion incluidos en el repositorio: `LICENSE-NVIDIA-OPEN-MODEL.txt`, `NOTICE`, `SHA256SUMS`
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada
