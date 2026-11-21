# glyd/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-wren

## Resumen

Glyd Wren es una cuantizacion de 4 bits del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, un transformer hibrido de tipo Mamba-2 con mezcla de expertos (MoE) desarrollado por NVIDIA. El modelo original declara 30.000 millones de parametros con aproximadamente 3.000 millones activos por token; sin embargo, los pesos reales publicados en este repositorio suman 18.345.871.650 parametros en safetensors, y el autor de la ficha no aclara esa discrepancia. La contribucion de Glyd no es arquitectonica sino de compresion: empaqueta los pesos en su propio formato i4 (4 bits por peso con escala de 16 bits por grupo de 32 pesos, unos 4,5 bits efectivos) para reducir el espacio en disco de 65,8 GB a 18 GB.

La propuesta resulta relevante porque apunta a un escenario concreto: ejecutar un MoE de gran tamano en GPU de consumo. Segun la model card, el nivel wren esta disenado para correr en una GPU de 8 GB de VRAM manteniendo los expertos en memoria del sistema (unos 24 GiB libres), lo que lo aleja de los requisitos habituales de un modelo de esta categoria. El precio es una cuantizacion con perdida (redondeo simple al codigo de 4 bits mas cercano) y un formato propietario que solo funciona con el motor Glyd.

El repositorio tiene cero descargas y cero likes en el momento de la consulta, fue creado el 21 de noviembre de 2026 y no incluye resultados de benchmarks ni mediciones de velocidad o calidad en GPU reales. Es, por tanto, un artefacto experimental de un tercero, no una distribucion oficial de NVIDIA, y debe tratarse como tal en cualquier evaluacion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Mamba-2 con mezcla de expertos (MoE), segun model card |
| Parametros totales | 18.345.871.650 (safetensors reales); el nombre del modelo declara 30B |
| Parametros activos | Aproximadamente 3B (segun nombre y model card); no verificado en los pesos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Formato propietario Glyd i4: 4 bits por peso con escala de 16 bits por grupo de 32 pesos (~4,5 bits efectivos); nivel "wren" con perdida |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (heredada del modelo base; tag `license: other`) |
| Formato de pesos | Formato propietario Glyd (no safetensors estandar, no GGUF); ejecutable solo con el motor Glyd |
| Tamano en disco | 18 GB (frente a 65,8 GB en BF16) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (revision a9904d24bcc1d289a1950fa9d2b978c47cf903b9) |
| Requisitos de plataforma | Linux + NVIDIA RTX serie 30 o superior; sin soporte para Mac ni AMD |
| Version minima del motor | Glyd 0.34.0 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base de NVIDIA, descrito en la model card como un hibrido Mamba-2 con mezcla de expertos: combina capas de espacio de estados (Mamba-2) con capas de atencion y un enrutador MoE que activa un subconjunto de expertos por token. El nombre comercial indica 30.000 millones de parametros totales y 3.000 millones activos, aunque los tensores empaquetados suman 18.345.871.650 parametros, cifra que no cuadra con la nomenclatura y que el autor no explica.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones de decodificacion del modelo base. Respecto a esta ficha concreta, el unico proceso documentado es la compresion: cada peso se redondea al codigo de 4 bits mas cercano y se multiplica por la escala de su grupo de 32 pesos, empaquetado con el comando `glyd-engine pack ... --layout i4`. No se aplica correccion de error, calibracion por capa ni ajuste posterior, por lo que la perdida de calidad es la propia de un redondeo uniforme sin optimizacion.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con tag `conversational`, por lo que se espera uso en dialogos multi-turno, aunque no se documentan formatos de prompt ni plantillas de chat.
- Razonamiento y codigo: capacidades heredadas del modelo base de NVIDIA; no hay evaluacion publicada en esta ficha que las cuantifique.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Eficiencia de activacion: al ser un MoE con aproximadamente 3B parametros activos, el coste de computo por token es mucho menor que el de un modelo denso de 30B, lo que explica la viabilidad de ejecutarlo con expertos en RAM del sistema.

## Casos de uso

- Prototipado de asistentes conversacionales en estaciones de trabajo con GPU de 8 GB: el nivel wren permite cargar un MoE de gran tamano en una RTX 3060/4060 manteniendo los expertos en RAM, lo que sirve para validar prompts y flujos de dialogo antes de migrar a hardware de servidor.
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de calidad de un redondeo i4 sin calibracion frente al BF16 original en tareas de generacion libre, siempre que se disponga de una linea base de referencia.
- Procesamiento por lotes de texto en equipos de sobremesa: al reducir el peso en disco a 18 GB, cabe en un SSD de consumo y permite trabajos nocturnos de resumen o clasificacion sin infraestructura cloud.
- Experimentacion academica con arquitecturas hibridas Mamba-2 + MoE: permite estudiar el comportamiento de un modelo de esta familia sin acceso a un clúster con A100/H100, a costa de asumir el sesgo de la cuantizacion.
- Pruebas de integracion del motor Glyd: el repositorio sirve como caso de prueba reproducible del comando `glyd run` y del empaquetado `--layout i4` en pipelines internos de validacion.
- Demostraciones locales sin conexion: escenarios de privacidad estricta donde el texto no puede salir del equipo y se acepta una calidad inferior a cambio de ejecucion local en Linux con GPU NVIDIA.
- No recomendado para atencion al cliente en produccion ni para generacion de codigo en CI/CD: no hay benchmarks, ni soporte de tool calling documentado, ni garantias de estabilidad del formato propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la velocidad y la calidad en GPU reales se mediran con la puerta de release de Glyd y se anadiran al repositorio cuando existan; en el momento de la consulta no aparecen datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: 8 GB para el nivel wren, segun la model card, con los expertos residentes en memoria del sistema (unos 24 GiB libres recomendados).
- GPU recomendadas: NVIDIA RTX serie 30 o superior (requisito explicito); no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, en teoria, en RTX 3060 8 GB y modelos superiores con 8 GB o mas de VRAM; no verificado con mediciones publicadas.
- Plataformas no soportadas: Mac y AMD, sin fecha de soporte anunciada.
- Opciones de despliegue: exclusivamente el motor Glyd (version 0.34.0 o superior) mediante `glyd run nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16:wren` o `glyd run glyd/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-wren`. No es compatible con vLLM, llama.cpp, Ollama ni TGI; para esos runtimes hay que usar los pesos originales de NVIDIA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| Glyd Nemotron 3.5 Lightning 30B-A3B wren (esta ficha) | 18,3B en safetensors (30B nominales, ~3B activos) | No disponible | i4 propietario, ~4,5 bits/peso, 18 GB | OpenMDW 1.1 | Solo Glyd | Repositorio de tercero, 0 descargas |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B BF16 (base) | 30B (~3B activos) | No disponible | BF16, 65,8 GB | OpenMDW 1.1 | Multiples runtimes estandar | Oficial de NVIDIA |
| MoE de ~30B con ~3B activos en GGUF (categoria generica) | ~30B (~3B activos) | Depende del modelo | Q4_K_M, Q5_K_M, Q8_0 | Depende del modelo | llama.cpp, Ollama | Amplia |

La comparacion directa mas util es contra el modelo base: mismos pesos de origen y misma licencia, pero el original en BF16 ocupa 65,8 GB y requiere hardware de gama alta, mientras que wren ocupa 18 GB a cambio de una perdida de calidad no medida y de quedar atado a un motor propietario. Frente a alternativas GGUF de la misma categoria, wren pierde portabilidad y verificabilidad; su unica ventaja documentada es el tamano en disco y el requisito de 8 GB de VRAM.

## Limitaciones y advertencias

- Cuantizacion con perdida sin calibracion: redondeo simple a 4 bits por peso con escala por grupo de 32; no hay evaluacion publicada del impacto en perplejidad ni en tareas concretas.
- Formato propietario y dependencia de proveedor: los pesos solo se ejecutan con el motor Glyd 0.34.0 o superior; no hay conversion documentada a GGUF ni a safetensors estandar.
- Plataforma restringida: solo Linux con GPU NVIDIA RTX serie 30 o superior; sin soporte para Mac, AMD ni CPU pura.
- Discrepancia de parametros: el nombre declara 30B y los safetensors suman 18,3B; conviene verificar la integridad de los pesos antes de cualquier uso serio.
- Ausencia total de benchmarks y de mediciones de velocidad: no se puede afirmar nada sobre calidad, latencia o throughput en produccion.
- Riesgo de alucinacion y sesgos: no documentados en esta ficha; al no haber evaluacion del modelo base en el repositorio, no puede acotarse el efecto combinado del modelo y la cuantizacion.
- Idiomas y contexto: sin declaracion de idiomas soportados ni de longitud de contexto, lo que impide planificar aplicaciones multilingues o de contexto largo.
- Licencia: OpenMDW 1.1 heredada del modelo base; deben revisarse sus terminos para uso comercial, ya que el tag del repositorio es `license: other` y la ficha no reproduce las condiciones.
- Madurez: repositorio creado y actualizado en noviembre de 2026, con cero descargas y cero likes; es un artefacto experimental de un tercero, no una distribucion oficial de NVIDIA.
- Soporte de tool calling y agentes no confirmado: no debe asumirse para integraciones con APIs o pipelines automatizados.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/glyd/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-wren
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Motor Glyd: no disponible (la model card solo menciona el comando `glyd run` y la version 0.34.0, sin enlace al repositorio)
