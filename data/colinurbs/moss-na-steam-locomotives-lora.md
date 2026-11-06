# colinurbs/moss-na-steam-locomotives-lora

## Resumen

`colinurbs/moss-na-steam-locomotives-lora` es un adaptador LoRA para el modelo de difusion de imagenes MOSS-Image (base `OpenMOSS/MOSS-Image-Base`), desarrollado por el usuario colinurbs. Su proposito es acotado y especializado: generar fotografias de locomotoras de vapor norteamericanas con fidelidad a clases historicas concretas, desde la Union Pacific 844 hasta la Union Pacific Big Boy 4014, pasando por Malles, cab-forward y arreglos de ruedas de 4-4-0 a 4-8-4.

El adaptador se entrena sobre 2.878 fotografias de Wikimedia Commons (licencias CC BY, CC BY-SA, CC0 y dominio publico) organizadas en 46 clases, con captions largos, medios y cortos. El autor lo etiqueta como v0.5 porque varias clases siguen fallando de forma sistematica (locomotoras de engranajes, cab-forward y rotulos de numeros de via).

Es relevante para quien necesite ilustracion ferroviaria historica con control de clase concreto sin recurrir a un modelo generativo de proposito general, aunque su alcance es muy estrecho y su calidad depende del modelo base sobre el que se aplique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion de imagenes (MOSS-Image) |
| Parametros totales | no disponible (adaptador LoRA rank 64 / alpha 16; el modelo base no se detalla) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; entrenado con INT8 y block swap |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`na_steam_locomotives_moss_v0.5.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 16 entrenado con kohya sd-scripts en su variante para MOSS-Image, sobre una GPU RTX 4070 Super con cuantizacion INT8 y block swap. El entrenamiento se realizo en tres tandas: 5.500 pasos a learning rate 1,5e-4 con warmup de 200 pasos y decaimiento coseno (interrumpida por un corte de luz), 2.000 pasos de reanudacion con lr de 3,85e-5 a 1,5e-5, y 6.000 pasos a lr 2e-4 con warmup de 100 pasos y decaimiento coseno hasta el 10 %. En total, 13.500 pasos con AdamW8bit, batch 1 y buckets de 1 MP.

El dataset consta de 2.878 fotos de Wikimedia Commons repartidas en 46 clases, con atribucion por imagen en `training_data_attribution.csv`. Cada foto dispone de tres captions (largo, medio y corto) encabezados por una linea de nombre. Las clases escasas se repitieron, y en la tercera tanda se aplicaron repeticiones extra a las clases dificiles: Climax y Willamette x6, cab-forward y Challenger x4, Heisler x3, Shay, Big Boy y Mallet x2. No se menciona uso de RLHF ni DPO, algo esperable en un adaptador de difusion.

## Capacidades

- Generacion de imagenes fotorrealistas de locomotoras de vapor norteamericanas en estilo fotografia de archivo ferroviario.
- Control de clase concreta: 46 clases que incluyen locomotoras preservadas y famosas (UP 844, SP 4449, N&W 611, ATSF 3751, MILW 261, SP&S 700, C&O 614, Reading 2102, CN 6060, NKP 765, PM 1225, PRR K4s, NYC 999, W&A General), articuladas (Big Boy, Challenger, cab-forward, N&W 1218, Malles), arreglos de ruedas de 4-4-0 a 4-8-4, motores de engranajes para tala y via estrecha.
- Generacion de libreas y escenas: el autor indica que las libreas y los entornos salen bien.
- Composicion fotografica controlable: angulo de camara, humo, vapor, tren y paisaje descritos en el prompt.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o video, por no ser aplicables a un modelo de difusion.

## Casos de uso

- Ilustracion editorial ferroviaria: generar imagenes de una locomotora concreta (por ejemplo, SP 4449) para articulos, libros o revistas de historia del ferrocarril, con control de la clase y del entorno.
- Material didactico: crear laminas de arreglos de ruedas (4-4-0, 2-8-2, 4-8-4) para explicar diferencias tecnicas en aulas o museos.
- Documentacion de preservacion: generar reconstrucciones visuales de libreas historicas de locomotoras preservadas para paneles informativos.
- Prototipado de arte conceptual: producir referencias visuales para modelismo ferroviario o dioramas antes de encargar ilustracion definitiva.
- Contenido para comunidades railfan: imagenes de acompanamiento en blogs y foros con prompts descriptivos al estilo de una leyenda fotografica.
- Pruebas de pipelines de difusion: banco de pruebas de LoRA de dominio estrecho para evaluar fidelidad de clase frente a modelos base de proposito general.
- Composicion de escenas historicas: combinar la locomotora con un paisaje (llanura de Wyoming, puente de acero en invierno) para recrear epocas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta ajustes de inferencia probados: strength 1,0, CFG 3, 40 pasos, sampler euler / sgm_uniform, shift 5, resolucion 1216x832, sobre MOSS-Image-Base y MOSS-Image-SFT, con mejor nitidez en SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base MOSS-Image, no del adaptador (el repo pesa 0,6 GB, pero el modelo base requiere su propio presupuesto de memoria).
- GPU de entrenamiento documentada: una RTX 4070 Super con INT8 y block swap, lo que sugiere que el ajuste fino es viable en GPU de consumo.
- GPU recomendadas: no disponibles; para inferencia se asume lo que exija MOSS-Image (no especificado en la informacion).
- Cabe en GPU de consumo: el entrenamiento se realizo en una RTX 4070 Super; la inferencia depende del modelo base.
- Opciones de despliegue: no disponibles; el adaptador es un safetensors compatible con el ecosistema de MOSS-Image y kohya sd-scripts.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|
| colinurbs/moss-na-steam-locomotives-lora | LoRA sobre MOSS-Image | Locomotoras de vapor norteamericanas | no disponible | HuggingFace y Civitai |
| colinurbs/moss-trains-lora | LoRA sobre MOSS-Image | Trenes diésel de mercancias | no disponible | HuggingFace |
| colinurbs/moss-passenger-trains-lora | LoRA sobre MOSS-Image | Trenes de pasajeros | no disponible | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento comparables para estos adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- Las locomotoras de engranajes (Shay, Heisler, Climax) se generan como locomotoras de bielas, a veces con el nombre rotulado encima.
- Las cab-forward se dibujan con la cabina en la parte trasera.
- Los numeros de carretera y los rotulos de numero suelen salir ilegibles o corruptos, como reconoce el propio autor en la imagen de muestra.
- Es la version v0.5: el autor admite que las clases listadas como problematicas siguen fallando.
- Licencia no especificada: no se puede confirmar el uso comercial del adaptador. El dataset se basa en fotos de Wikimedia Commons con licencias CC BY, CC BY-SA, CC0 y dominio publico, con atribucion en `training_data_attribution.csv`, pero eso no determina la licencia del modelo derivado.
- El ambito es muy estrecho: solo locomotoras de vapor norteamericanas; para diesel o pasajeros hay adaptadores separados del mismo autor.
- Dependencia total del modelo base MOSS-Image: la calidad final varia entre MOSS-Image-Base y MOSS-Image-SFT.
- Riesgo de alucinacion visual en detalles tecnicos (numeros, placas, configuracion de ejes) y en escenas historicas no representadas en el dataset.
- No hay datos publicados de benchmarks ni de evaluacion cuantitativa de fidelidad por clase.

## Enlaces

- [HuggingFace: colinurbs/moss-na-steam-locomotives-lora](https://huggingface.co/colinurbs/moss-na-steam-locomotives-lora)
- [Civitai: North American Steam Locomotives](https://civitai.com/models/3033552)
- [Adaptador complementario para trenes diesel: colinurbs/moss-trains-lora](https://huggingface.co/colinurbs/moss-trains-lora)
- [Adaptador complementario para trenes de pasajeros: colinurbs/moss-passenger-trains-lora](https://huggingface.co/colinurbs/moss-passenger-trains-lora)
- [Modelo base: OpenMOSS/MOSS-Image-Base](https://huggingface.co/OpenMOSS/MOSS-Image-Base)
