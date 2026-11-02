# Gabriel/diffu-moss-hand-eight

## Resumen

diffu-moss-hand-eight es un adaptador LoRA para el modelo de difusion texto-a-imagen MOSS-Image-Base, desarrollado por el usuario Gabriel en el contexto del proyecto diffu, una herramienta para generar paginas de archivo sinteticas con etiquetas ALTO y PAGE exactas. El adaptador permite que el modelo base dibuje escritura manuscrita correspondiente a ocho "manos" (estilos caligraficos) de archivos historicos suecos, seleccionables mediante la mencion de la coleccion correspondiente en el prompt. Resuelve un problema concreto: la escasez de datos etiquetados para entrenar modelos de reconocimiento de texto manuscrito historico (HTR) y de lectura de paginas.

Tecnicamente se trata de un adaptador PEFT de rango 32 y alpha 32 aplicado sobre 265 capas lineales del DiT de MOSS-Image, con pesos en bfloat16 y un tamano de repositorio de 0,2 GB. El modelo base es un transformer de difusion (DiT) para generacion de imagenes a partir de texto, con un refinador de texto, dos embedders y una capa final. El adaptador cubre los 42 bloques conjuntos del DiT (q, k, v, o, ffn_up_gate, ffn_down), ademas del refinador de texto, los embedders y la capa final.

Su relevancia es acotada pero especifica: se publica como pieza de un pipeline de generacion de datos sinteticos para archivos, con licencia Apache-2.0 y solo idioma sueco (sv). No es un modelo generalista, sino una herramienta de aumento de datos para investigacion en humanidades digitales y HTR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre DiT de difusion texto-a-imagen (MOSS-Image-Base) |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base no reporta cifra en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bfloat16) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, layout de claves PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el DiT de MOSS-Image-Base mediante un `LoraConfig` de PEFT con rango 32 y alpha 32, distribuido en 265 capas lineales. Cubre los 42 bloques conjuntos del DiT (q, k, v, o, ffn_up_gate, ffn_down), el refinador de texto, los dos embedders y la capa final. Los nombres de modulo son los propios de MOSS-Image, de modo que el adaptador es aplicable a cualquier implementacion que los conserve; la implementacion `MossTransformer` de diffu los mantiene. El adaptador no toma pagina de muestra: el estilo caligrafico proviene del adaptador y del prompt.

El entrenamiento uso 1.280 ventanas de aproximadamente 1 MP recortadas de paginas de verdad terreno de escritura manuscrita de archivos suecos, cada una con caption en formato de prompt de MOSS Layout (coleccion nombrada, texto exacto de cada linea y su caja). Se entreno con KohakuMossTrainer (LoRA via LyCORIS, algo `lora`), optimizador AdamW a 1e-4 durante 2.000 pasos, con el muestreo de niveles de ruido propio de MOSS-Image y el codificador de texto y el VAE congelados. El formato se convirtio del export de LyCORIS al layout de PEFT, con verificacion capa por capa: cada clave cae en una capa que PEFT construye con esta configuracion, sin claves faltantes ni sobrantes, y el escalado `(alpha / r) x B @ A` coincide exactamente con el `up @ down` entrenado.

## Capacidades

- Generacion de imagenes texto-a-imagen de paginas manuscritas de archivo, con estilo caligrafico seleccionable entre ocho manos.
- Seleccion de mano por mencion de la coleccion en el caption del prompt (Göteborg register, Jämtlands domsaga, Stora Kopparbergs bergslag, Landskapshandlingar, Överståthållarämbetet, Påhlman's travel journals, Riksregistraturet, Trolldomskommissionen).
- Generacion de paginas con etiquetas ALTO y PAGE exactas cuando se usa dentro del pipeline diffu.
- Integracion con el flujo de dibujo de MOSS-Image: aproximadamente 1 MP, 50 pasos, guidance 3, shift 5, block 22 omitido en la pasada incondicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de texto; es exclusivamente un adaptador de generacion de imagenes.
- Capacidad multilingue limitada al sueco (sv) en los datos de entrenamiento.

## Casos de uso

- Generacion de datos sinteticos para entrenamiento de HTR: el adaptador produce ventanas de pagina con texto manuscrito y etiquetas ALTO/PAGE exactas, lo que permite ampliar corpus de entrenamiento de modelos de reconocimiento de escritura historica sin depender de digitalizaciones adicionales.
- Aumento de datos para archivos historicos suecos: se pueden generar paginas de las ocho colecciones documentadas para cubrir estilos caligraficos poco representados en los corpus existentes, usando el nombre de la coleccion en el caption para fijar la mano.
- Pruebas de robustez de modelos de lectura de pagina: al generar paginas sinteticas con etiquetas exactas, se pueden construir conjuntos de evaluacion controlados para medir la precision de lectores de pagina en condiciones conocidas.
- Investigacion en humanidades digitales: reconstruccion o simulacion de paginas de colecciones concretas (por ejemplo, Riksregistraturet o Trolldomskommissionen) para estudiar la variabilidad caligrafica sin manipular originales.
- Prototipado de pipelines de archivo: generar paginas de prueba para validar sistemas de indexacion, segmentacion de lineas o extraccion de texto antes de desplegarlos sobre fondos reales.
- Docencia y demostraciones: producir ejemplos visuales de escritura de archivo sueca del periodo 1676-1825 con estilos identificables por coleccion, utiles en materiales formativos sobre paleografia y archivistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador ocupa 0,2 GB, pero el requisito dominante es el del modelo base MOSS-Image-Base, cuyo tamano no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT para fusionar el adaptador en el DiT (`PeftModel.from_pretrained(...).merge_and_unload()`), seguido de `diffu-moss-init` para construir el modelo MOSS-Image completo con el transformer fusionado.
- Latencia y throughput: no disponible; el flujo de dibujo indicado es de aproximadamente 50 pasos con guidance 3 y shift 5, lo que condiciona el coste por imagen.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores o modelos comparables de generacion de escritura manuscrita historica con etiquetas ALTO/PAGE.

## Limitaciones y advertencias

- Solo cubre ocho manos, cada una de una unica coleccion; otras manos y tipos de pagina no han sido probados.
- El texto dibujado debe verificarse: diffu relee cada linea generada y marca como poco clara en las etiquetas cualquier linea que no pueda confirmar.
- El adaptador esta entrenado exclusivamente con datos en sueco (sv); no se garantiza comportamiento en otros idiomas.
- Es un adaptador, no un modelo autonomo: requiere el snapshot de MOSS-Image-Base en la revision `85975793d8b3d432f1b6e27f352abaa4c2a4c0d3` y una implementacion compatible con los nombres de modulo del DiT.
- Riesgo de alucinacion visual: el modelo puede generar texto manuscrito inexacto o ininteligible, por lo que no debe usarse como fuente documental sin verificacion.
- Licencia Apache-2.0, igual que el modelo base; no se documentan restricciones adicionales para uso comercial en la informacion disponible.
- El repositorio no registra descargas ni likes, y no se han publicado evaluaciones cuantitativas de calidad de las paginas generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabriel/diffu-moss-hand-eight
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Proyecto diffu: https://github.com/Borg93/diffu2
- Imagen de ejemplo: images/example.png (referenciada en la model card del repositorio)
