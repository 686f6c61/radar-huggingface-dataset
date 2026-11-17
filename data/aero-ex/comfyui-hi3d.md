# Aero-Ex/ComfyUI-Hi3D

## Resumen

Hi3D v1.0 (SPARC3D) es un modelo de refinamiento de mallas 3D que Aero-Ex ha reempaquetado como un nodo de ComfyUI. El repositorio no contiene un modelo de lenguaje, sino los pesos de refinamiento de malla del release oficial de Hi3D v1.0, fusionados en un unico checkpoint safetensors y acompanados de dos codificadores de imagen (DINOv2-large y CLIP ViT-L/14) para condicionar la generacion. El objetivo es permitir que un flujo de ComfyUI reciba una imagen y produzca o refine una malla 3D de forma iterativa.

El paquete incluye dos variantes del checkpoint: una en fp16/fp32 tal como se publico y otra con las capas lineales de los bloques transformer cuantizadas a int8 (tensorwise, convrot) y atencion int8. La cadena de refinamiento documentada permite pasar de una malla de 512 a 1024 y luego a 1536, encadenando las dos torres transformer incluidas en el unico archivo.

Es relevante para quien trabaja en pipelines de generacion 3D dentro de ComfyUI porque evita tener que gestionar por separado los pesos `transformer_512`, `transformer_1024` y el VAE de malla, y porque ofrece una ruta de cuantizacion int8 para reducir el consumo de VRAM. El repositorio ocupa 15,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de refinamiento de malla (dos torres: `transformer_512` y `transformer_1024`) con VAE de malla; codificadores de imagen DINOv2-large y CLIP ViT-L/14 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelo de lenguaje) |
| Tipos de cuantizacion | fp16/fp32 (checkpoint original) e int8 tensorwise con convrot en lineales de bloques transformer y atencion int8 |
| Idiomas soportados | no disponible |
| Licencia | Hi3D Open License Agreement Version 1.0 (OCEANO HK HOLDING LIMITED) |
| Formato de pesos | safetensors (checkpoint unico y codificadores CLIP Vision) |
| Tamano del repositorio | 15,0 GB |
| Resoluciones de malla | 512, 1024 y 1536 (cadena de refinamiento) |

## Arquitectura y entrenamiento

La informacion disponible describe dos torres transformer (`transformer_512` y `transformer_1024`) que operan junto a un VAE de malla. El flujo de inferencia encadena una primera pasada de refinamiento a 512 y una segunda a 1024, con la posibilidad de extender la cadena hasta 1536 segun los workflows de ejemplo del node pack. La condicion de imagen se aporta mediante dos codificadores: DINOv2-large (Meta, Apache 2.0) y CLIP ViT-L/14 (OpenAI, MIT), ambos incluidos sin modificaciones.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion. El reempaquetado de Aero-Ex se limita a fusionar los pesos `transformer_512`, `transformer_1024` y `vae` en un unico archivo con claves renombradas, y a cuantizar a int8 las capas lineales de los bloques transformer en la variante `hi3d_v1_int8.safetensors`; los valores de los pesos no se modifican.

## Capacidades

- Refinamiento de mallas 3D a partir de una imagen de entrada, usando los codificadores DINOv2-large y CLIP ViT-L/14 como condicionamiento.
- Generacion y refinamiento en cascada a resoluciones de malla de 512, 1024 y 1536.
- Carga integrada en ComfyUI mediante los nodos **Load Hi3D Checkpoint** y **Load CLIP Vision** del node pack `Aero-Ex-ComfyUI-Hi3D`.
- Ejecucion en dos precisiones: fp16/fp32 con el checkpoint original e int8 con la variante cuantizada.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni audio.
- No se documenta soporte multilingue ni modo de razonamiento explicito.

## Casos de uso

- Prototipado de assets 3D en ComfyUI: cargar una imagen de referencia con **Load CLIP Vision**, ejecutar un unico pase de refinamiento con el checkpoint Hi3D y obtener una malla lista para iterar en el editor de mallas de ComfyUI.
- Refinamiento progresivo de malla: usar el workflow de cadena 512 → 1024 → 1536 para partir de una malla de baja resolucion y aumentar el detalle en pasos controlados, aprovechando las dos torres incluidas en el checkpoint unico.
- Despliegue con VRAM limitada: emplear `hi3d_v1_int8.safetensors` para reducir el peso de los bloques transformer y de la atencion, manteniendo la misma interfaz de nodos que la version fp16.
- Integracion en pipelines de generacion de contenido: encadenar el nodo Hi3D con otros nodos de ComfyUI (por ejemplo, generacion de imagen previa) para producir mallas condicionadas por imagen dentro de un mismo grafo.
- Investigacion sobre refinamiento de malla: comparar la salida de la variante fp16/fp32 con la int8 para medir el impacto de la cuantizacion tensorwise en la calidad geometrica.
- Automatizacion de variantes de un asset: lanzar el refinamiento sobre varias imagenes de referencia del mismo objeto para obtener distintas mallas candidatas y seleccionar la mejor manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 15,0 GB, por lo que el almacenamiento necesario para los pesos supera esa cifra al incluir los dos checkpoints y los dos codificadores.
- VRAM estimada: no disponible de forma explicita. La variante int8 reduce el peso de los bloques transformer y de la atencion respecto a fp16, pero no se publican cifras de memoria pico.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI con el node pack `Aero-Ex-ComfyUI-Hi3D` (nodos **Load Hi3D Checkpoint** y **Load CLIP Vision**). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones de malla | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D v1.0 (este repo) | Refinamiento de malla con transformer + VAE de malla | 512, 1024, 1536 | fp16/fp32 e int8 | Hi3D Open License 1.0 | Hugging Face + node pack de ComfyUI |
| Hi3D v1.0 oficial | Refinamiento de malla (pesos separados) | no disponible en la informacion | no disponible | Hi3D Open License 1.0 | GitHub `hi3d-official/Hi3Dv1.0` |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de terceros que permitan una comparacion cuantitativa con otros modelos de refinamiento de malla.

## Limitaciones y advertencias

- La licencia Hi3D Open License Agreement 1.0 incluye una Acceptable Use Policy que se aplica a cualquier uso de los pesos; es necesario revisar `LICENSE`, `NOTICE` y `THIRD_PARTY_LICENSES.md` antes de un uso comercial.
- Los pesos de `checkpoints/` son una modificacion del release oficial: claves renombradas y, en la variante int8, lineales cuantizadas. Cualquier discrepancia con el modelo original debe contrastarse contra el repositorio oficial.
- Los codificadores DINOv2-large y CLIP ViT-L/14 son modelos de terceros con licencias propias (Apache 2.0 y MIT respectivamente) y no estan cubiertos por la licencia Hi3D.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque el modelo no procesa texto.
- No se publican cifras de VRAM, latencia ni calidad geometrica, lo que impide estimar con precision el coste de produccion.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de comunidad ni de validacion externa del reempaquetado.
- La fecha de creacion indicada (2026-11-15) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aero-Ex/ComfyUI-Hi3D
- Node pack de ComfyUI: https://github.com/Aero-Ex/Aero-Ex-ComfyUI-Hi3D
- Release oficial de Hi3D v1.0: https://github.com/hi3d-official/Hi3Dv1.0
- DINOv2 (Meta, Apache 2.0): no disponible en la informacion proporcionada
- CLIP ViT-L/14 (OpenAI, MIT): no disponible en la informacion proporcionada
